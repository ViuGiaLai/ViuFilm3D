"use client";

import {
  createClient,
  type SupabaseClient,
  type RealtimeChannel,
} from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
const rooms = new Map<string, RealtimeChannel>();

export type WatchPartyEvent = {
  type: "play" | "pause" | "seek" | "change_speed" | "change_episode" | "sync" | "request_sync" | "heartbeat";
  time?: number;
  speed?: number;
  episode?: number;
  paused?: boolean;
  by: string; // user id or something
};

export type WatchPartyViewer = {
  id: string;
  name: string;
  avatar?: string; // Legacy fallback
  avatarId?: string | null;
  avatarVersion?: string | null;
  avatarFrameId?: string;
  isHost?: boolean;
};

export function joinWatchParty(
  room: string,
  onMessage: (event: WatchPartyEvent) => void,
  onPresenceSync?: (presenceCount: number, viewers: WatchPartyViewer[]) => void,
  userPayload?: WatchPartyViewer
): { channel: RealtimeChannel; leave: () => void; broadcast: (event: WatchPartyEvent) => void } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || !room) return null;

  client ??= createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (rooms.has(room)) {
    client.removeChannel(rooms.get(room)!);
    rooms.delete(room);
  }

  const userId = userPayload?.id || Math.random().toString(36).substring(2, 10);
  const channel = client.channel(room, {
    config: { 
      broadcast: { self: false },
      presence: { key: userId }
    },
  });

  channel
    .on("broadcast", { event: "sync" }, (payload) => {
      onMessage(payload.payload as WatchPartyEvent);
    })
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const count = Object.keys(state).length;
      const viewers: WatchPartyViewer[] = [];
      for (const key in state) {
        if (state[key] && state[key]!.length > 0) {
          viewers.push(state[key]![0] as unknown as WatchPartyViewer);
        }
      }
      if (onPresenceSync) onPresenceSync(count, viewers);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track(userPayload || { id: userId, name: "Khách", isHost: false });
      }
    });

  rooms.set(room, channel);

  return {
    channel,
    leave: () => {
      void channel.untrack();
      client?.removeChannel(channel);
      rooms.delete(room);
    },
    broadcast: (event: WatchPartyEvent) => {
      void channel.send({
        type: "broadcast",
        event: "sync",
        payload: event,
      });
    },
  };
}
