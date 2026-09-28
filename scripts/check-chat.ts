import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { createClient, type RealtimeChannel } from "@supabase/supabase-js";
import { mergeMessages, shouldFollowMessages } from "../lib/chat-state";

async function main() {
  assert.deepEqual(
    mergeMessages(
      [{ id: 2, body: "old" }],
      [
        { id: 1, body: "first" },
        { id: 2, body: "new" },
      ],
    ),
    [
      { id: 1, body: "first" },
      { id: 2, body: "new" },
    ],
  );
  assert.equal(shouldFollowMessages(900, 1000, 100), true);
  assert.equal(shouldFollowMessages(200, 1000, 100), false);
  console.log(
    "PASS merge/deduplication/order and preserve reader scroll position",
  );
  if (!process.argv.includes("--live")) {
    console.log(
      "Use --live to create two temporary test identities and verify delivery, then clean them up.",
    );
    return;
  }
  loadEnvConfig(process.cwd());
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY,
    key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  assert.ok(url && secret && key, "Supabase environment missing");
  const admin = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const realtime = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const fixtures: {
    authId: string;
    email: string;
    password: string;
    id?: number;
    cookie?: string;
  }[] = [];
  const channels: RealtimeChannel[] = [];
  const base = process.env.CHAT_SMOKE_BASE_URL ?? "http://localhost:3000";
  async function api(
    path: string,
    fixture?: (typeof fixtures)[number],
    method = "GET",
    body?: unknown,
  ) {
    const response = await fetch(new URL(`/api/v1${path}`, base), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(fixture?.cookie ? { Cookie: fixture.cookie } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
    const json = await response.json();
    return { response, json };
  }
  async function listen(topic: string) {
    let received = false;
    const channel = realtime
      .channel(topic)
      .on("broadcast", { event: "changed" }, () => {
        received = true;
      });
    channels.push(channel);
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Realtime subscription timed out")),
        10000,
      );
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timer);
          resolve();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          clearTimeout(timer);
          reject(new Error(`Realtime subscription: ${status}`));
        }
      });
    });
    return async () => {
      const deadline = Date.now() + 5000;
      while (!received && Date.now() < deadline)
        await new Promise((resolve) => setTimeout(resolve, 50));
      assert.ok(
        received,
        "Saved message did not deliver realtime invalidation",
      );
    };
  }
  try {
    for (let index = 0; index < 2; index++) {
      const email = `chat-check-${randomUUID()}@example.com`,
        password = `${randomUUID()}Aa!`;
      const created = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: `Đạo hữu kiểm thử ${index + 1}` },
      });
      if (created.error)
        throw new Error(
          `Cannot create test identity: ${created.error.message}`,
        );
      const fixture = {
        authId: created.data.user!.id,
        email,
        password,
      } as (typeof fixtures)[number];
      fixtures.push(fixture);
      const login = await api("/auth/login", undefined, "POST", {
        email,
        password,
      });
      assert.equal(login.response.status, 200, "Test login failed");
      fixture.id = login.json.data.id;
      fixture.cookie = login.response.headers
        .getSetCookie()
        .map((cookie) => cookie.split(";")[0])
        .join("; ");
    }
    const [first, second] = fixtures;
    assert.equal(
      (await api(`/me/messages/${second.id}`, first)).response.status,
      403,
      "Non-friends must not read private letters",
    );
    assert.equal(
      (await api("/community/world")).response.status,
      401,
      "World feed requires login",
    );
    assert.equal(
      (await api(`/users/${second.id}/friend`, first, "POST")).response.status,
      201,
    );
    const inbox = (await api("/me/social", second)).json.data;
    assert.equal(inbox.incoming.length, 1);
    assert.equal(
      (await api(`/me/friends/${inbox.incoming[0].id}`, second, "PATCH"))
        .response.status,
      200,
    );
    const delivered = await listen(inbox.realtimeTopic);
    const text = `Mật thư kiểm thử ${randomUUID()}`;
    const sent = await api(`/me/messages/${second.id}`, first, "POST", {
      body: text,
    });
    assert.equal(sent.response.status, 201);
    await delivered();
    assert.equal((await api("/me/social", second)).json.data.unreadCount, 1);
    const received = await api(`/me/messages/${first.id}`, second);
    assert.equal(received.response.status, 200);
    assert.ok(
      received.json.data.some((item: { body: string }) => item.body === text),
    );
    assert.equal((await api("/me/social", second)).json.data.unreadCount, 0);
    assert.equal(
      (
        await api(
          `/me/messages/${first.id}?before=${sent.json.data.id}`,
          second,
        )
      ).json.data.length,
      0,
    );
    console.log(
      "PASS friendship consent, private delivery, unread/read and cursor; realtime received",
    );
    const worldSchema = await admin
      .from("world_messages")
      .select("id")
      .limit(1);
    if (worldSchema.error) {
      console.log("PENDING world chat: migration not applied yet");
      return;
    }
    const worldDelivered = await listen("world:discussion");
    const worldText = `Luận đạo kiểm thử ${randomUUID()}`;
    const post = await api("/community/world", first, "POST", {
      body: worldText,
    });
    assert.equal(post.response.status, 201);
    await worldDelivered();
    const world = await api("/community/world", second);
    assert.equal(world.response.status, 200);
    assert.ok(
      world.json.data.items.some(
        (item: { body: string }) => item.body === worldText,
      ),
    );
    assert.ok(
      !JSON.stringify(world.json).includes(first.email),
      "World feed must not expose email",
    );
    console.log(
      "PASS world chat delivery and realtime, no private email exposed",
    );
  } finally {
    for (const channel of channels) await realtime.removeChannel(channel);
    for (const fixture of fixtures) {
      const profile = await admin
        .from("app_users")
        .delete()
        .eq("auth_user_id", fixture.authId)
        .eq("email", fixture.email);
      const identity = await admin.auth.admin.deleteUser(fixture.authId);
      if (profile.error || identity.error) {
        console.error(`Temporary identity cleanup failed: ${fixture.authId}`);
        process.exitCode = 1;
      }
    }
    console.log(
      `Cleanup completed for ${fixtures.length} temporary identities and their linked test messages.`,
    );
  }
}
main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Chat check failed");
  process.exitCode = 1;
});
