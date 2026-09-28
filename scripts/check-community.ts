import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { parseSupportProfile } from "../lib/admin-community";
import { userCardPosition } from "../lib/user-card-position";
import { avatarFrames } from "../lib/avatar-frames";
import { avatarFrameMedia } from "../lib/avatar-frame-media";

async function main() {
  assert.equal(avatarFrames.filter((f) => f.id !== "none").length, 37);
  assert.ok(avatarFrameMedia["realm-14"]?.animated);
  const profile = {
    name: "Đạo hữu",
    bio: "",
    avatarId: "moon",
    avatarFrameId: "realm-14",
    cultivationXp: 11900,
    frameGrants: [],
  };
  assert.deepEqual(
    parseSupportProfile({ ...profile, role: "admin", email: "private" }),
    profile,
  );
  for (const patch of [
    { cultivationXp: -1 },
    { cultivationXp: 1.5 },
    { frameGrants: ["unknown"] },
    { avatarId: "invalid" },
  ])
    assert.throws(() => parseSupportProfile({ ...profile, ...patch }));
  for (const width of [320, 768, 1440])
    for (const top of [0, 150, 650]) {
      const card = { width: Math.min(320, width - 24), height: 400 };
      const position = userCardPosition(
        { left: width - 20, top, bottom: top + 40 },
        card,
        { width, height: 800, top: 0 },
      );
      assert.ok(
        position.left >= 12 && position.left + card.width <= width - 12,
      );
      assert.ok(position.top >= 12 && position.top + card.height <= 788);
    }
  console.log(
    "PASS frame catalog, profile validation/whitelist and card viewport bounds",
  );
  if (!process.argv.includes("--live")) return;
  loadEnvConfig(process.cwd());
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  assert.ok(url && key);
  const db = createClient(url, key, { auth: { persistSession: false } });
  for (const table of [
    "app_users",
    "admin_community_audit",
    "world_messages",
  ]) {
    const { error } = await db
      .from(table)
      .select(table === "app_users" ? "avatar_frame_grants" : "id")
      .limit(1);
    assert.equal(error, null, `${table} migration readiness`);
  }
  const { data, error } = await db
    .from("app_users")
    .select("cultivation_xp")
    .eq("role", "admin");
  assert.equal(error, null);
  assert.ok(data?.length);
  assert.ok(data.every((row) => row.cultivation_xp >= 11900));
  const join = await db
    .from("world_messages")
    .select(
      "id,app_users!world_messages_sender_id_fkey(name,avatar_id,avatar_frame_id)",
    )
    .limit(1);
  assert.equal(join.error, null, "Explicit author relation must resolve");
  for (const [name, args] of [
    [
      "admin_support_profile",
      {
        p_actor: "not-an-admin@example.invalid",
        p_id: 0,
        p_expected: profile,
        p_next: profile,
        p_reason: "Authorization check",
      },
    ],
    [
      "admin_moderate_world",
      {
        p_actor: "not-an-admin@example.invalid",
        p_id: 0,
        p_status: "hidden",
        p_reason: "Authorization check",
      },
    ],
  ] as const) {
    const result = await db.rpc(name, args);
    assert.equal(
      result.error?.code,
      "42501",
      `${name} rejects non-admin without writes`,
    );
  }
  console.log(
    "PASS live migration readiness and admin highest realm (read-only)",
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
