"use client";

import {
  createClient,
  type SupabaseClient,
  type RealtimeChannel,
} from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
const subscriptions = new Map<
  string,
  { channel: RealtimeChannel; listeners: Set<() => void> }
>();

export function subscribeToInvalidation(
  topic: string,
  onChange: () => void,
): () => void {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || !topic) return () => undefined;

  client ??= createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  let subscription = subscriptions.get(topic);
  if (!subscription) {
    const listeners = new Set<() => void>();
    const emit = () => {
      for (const listener of listeners) listener();
    };
    const channel = client
      .channel(topic)
      .on("broadcast", { event: "changed" }, emit)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") emit();
      });
    subscription = { channel, listeners };
    subscriptions.set(topic, subscription);
  }
  subscription.listeners.add(onChange);
  const shared = subscription;

  return () => {
    shared.listeners.delete(onChange);
    if (!shared.listeners.size && subscriptions.get(topic) === shared) {
      subscriptions.delete(topic);
      void client?.removeChannel(shared.channel);
    }
  };
}
