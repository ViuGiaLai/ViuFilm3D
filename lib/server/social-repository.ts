import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function findFriendLink(firstId: number, secondId: number) {
  const { data, error } = await createSupabaseAdminClient()
    .from("friend_links")
    .select("id,requester_id,recipient_id,status")
    .in("requester_id", [firstId, secondId])
    .in("recipient_id", [firstId, secondId])
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function parsePositiveId(value: string) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
