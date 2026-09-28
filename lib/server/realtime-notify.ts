import "server-only";

import { createHmac } from "node:crypto";
import { getAuthSecret, getSupabaseAdminEnv } from "@/lib/server/env";

// These channels contain only invalidation signals. Actual comments and private
// messages always come from the authenticated API, never from Broadcast payloads.
export function socialRealtimeTopic(userId: number): string {
  const digest = createHmac("sha256", getAuthSecret())
    .update(`social:${userId}`)
    .digest("hex")
    .slice(0, 40);
  return `social:${digest}`;
}

export function commentsRealtimeTopic(movieId: number): string {
  return `movie-comments:${movieId}`;
}

async function publish(topic: string): Promise<void> {
  try {
    const { url, secretKey } = getSupabaseAdminEnv();
    await fetch(
      `${url}/realtime/v1/api/broadcast/${encodeURIComponent(topic)}/events/changed`,
      {
        method: "POST",
        headers: {
          apikey: secretKey,
          "Content-Type": "application/json",
        },
        body: "{}",
        signal: AbortSignal.timeout(1200),
      },
    );
  } catch {
    // Broadcast is best-effort; a failed signal must not undo a saved write.
  }
}

export async function notifyComments(movieId: number): Promise<void> {
  await publish(commentsRealtimeTopic(movieId));
}

export async function notifyWorld(): Promise<void> {
  await publish("world:discussion");
}

export async function notifySocial(userIds: number[]): Promise<void> {
  await Promise.all(
    [...new Set(userIds)].map((id) => publish(socialRealtimeTopic(id))),
  );
}
