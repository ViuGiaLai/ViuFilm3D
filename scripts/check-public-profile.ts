// Read-only smoke checks against the user's running app. No fixture writes.
import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(process.cwd());
const base = process.env.PROFILE_SMOKE_BASE_URL ?? "http://localhost:3000";
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const publicIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function checkPublicFields(value: unknown) {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    assert.ok(
      !/^(email|password|password_hash|auth_user_id|authUserId|access_token|refresh_token)$/i.test(
        key,
      ),
      "Public response contains a private field",
    );
    checkPublicFields(child);
  }
}

async function main() {
  assert.ok(url && secret, "Backend environment is required");
  const db = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const sample = await db
    .from("app_users")
    .select("public_id")
    .eq("status", "Đang hoạt động")
    .limit(1)
    .maybeSingle();
  assert.ifError(sample.error);
  assert.ok(
    sample.data && publicIdPattern.test(sample.data.public_id),
    "No public profile fixture exists",
  );
  const response = await fetch(
    `${base}/api/v1/users/${sample.data.public_id}/profile`,
    { signal: AbortSignal.timeout(15000) },
  );
  assert.equal(
    response.status,
    200,
    "Public profile API must load without login",
  );
  const profile = (await response.json()).data;
  assert.equal(profile.publicId, sample.data.public_id);
  assert.ok(
    Number.isInteger(profile.cultivationXp) && profile.cultivationXp >= 0,
  );
  checkPublicFields(profile);
  console.log(
    "OK: hồ sơ công khai qua UUID, điểm hợp lệ, không trả email/token/auth ID.",
  );

  const oldPath = await fetch(`${base}/api/v1/users/2/profile`, {
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(
    oldPath.status,
    400,
    "Numeric profile IDs must not be accepted as public URLs",
  );
  console.log("OK: URL hồ sơ dạng ID tăng dần bị từ chối.");

  const movies = await fetch(`${base}/api/v1/movies`, {
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(movies.status, 200);
  const catalog = (await movies.json()).data;
  assert.ok(
    Array.isArray(catalog) && catalog.length,
    "No movie fixture exists",
  );
  const movie =
    catalog.find((entry) => entry.id === 1790440749205) ?? catalog[0];
  assert.ok(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(movie.slug),
    "Movie slug must be URL-safe",
  );
  const comments = await fetch(
    `${base}/api/v1/movies/${movie.id}/comments?offset=0`,
    { signal: AbortSignal.timeout(15000) },
  );
  assert.equal(
    comments.status,
    200,
    "Comment author embedding must be unambiguous",
  );
  const page = (await comments.json()).data;
  assert.ok(Array.isArray(page.items));
  for (const comment of page.items) {
    assert.ok(publicIdPattern.test(comment.authorPublicId));
    assert.ok(Number.isInteger(comment.authorCultivationXp));
  }
  checkPublicFields(page);
  console.log(
    "OK: slug phim và API bình luận; trường tác giả/cảnh giới hợp lệ.",
  );
}

main().catch((error) => {
  console.error(
    "FAIL: kiểm tra public API chưa đạt:",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
});
