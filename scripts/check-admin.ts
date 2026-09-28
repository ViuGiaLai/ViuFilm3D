import assert from "node:assert/strict";

async function main() {
  const base = process.env.ADMIN_SMOKE_BASE_URL ?? "http://localhost:3000";
  for (const path of [
    "/api/v1/users",
    "/api/v1/admin/comments",
    "/api/v1/admin/comments?offset=-1",
    "/api/v1/admin/comments?status=hidden&q=test",
    "/api/v1/admin/world",
    "/api/v1/admin/community-audit",
  ]) {
    const response = await fetch(new URL(path, base), {
      signal: AbortSignal.timeout(10000),
      redirect: "manual",
    });
    assert.equal(
      response.status,
      401,
      `Unauthenticated request must be rejected: ${path}`,
    );
    console.log(`PASS admin authorization: ${path}`);
  }
  console.log(
    "Read-only admin authorization checks passed. No authenticated writes performed.",
  );
}
main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Admin check failed");
  process.exitCode = 1;
});
