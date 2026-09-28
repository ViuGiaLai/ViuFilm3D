import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getSocialIdentity } from "@/lib/server/social-identity";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import type { FriendLink, SocialInbox, SocialUser } from "@/lib/social-types";
import { socialRealtimeTopic } from "@/lib/server/realtime-notify";

export async function GET() {
  try {
    const viewer = await getSocialIdentity();
    if (!viewer) return apiProblem("Vui lòng đăng nhập.", 401);
    const db = createSupabaseAdminClient();
    const [linksResult, unreadResult] = await Promise.all([
      db
        .from("friend_links")
        .select("id,requester_id,recipient_id,status")
        .or(`requester_id.eq.${viewer.id},recipient_id.eq.${viewer.id}`)
        .order("updated_at", { ascending: false })
        .limit(500),
      db
        .from("direct_messages")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", viewer.id)
        .is("read_at", null),
    ]);
    if (linksResult.error) throw linksResult.error;
    if (unreadResult.error) throw unreadResult.error;

    const links = linksResult.data ?? [];
    const otherIds = links.map((link) =>
      Number(link.requester_id) === viewer.id
        ? Number(link.recipient_id)
        : Number(link.requester_id),
    );
    const profiles = otherIds.length
      ? await db.from("app_users").select("*").in("id", otherIds)
      : { data: [], error: null };
    if (profiles.error) throw profiles.error;
    const people = new Map<number, SocialUser>(
      (profiles.data ?? []).map((row) => [
        Number(row.id),
        {
          id: Number(row.id),
          publicId: row.public_id,
          cultivationXp: Number(row.cultivation_xp ?? 0),
          avatarFrameId: row.avatar_frame_id,
          name: row.name,
          avatarId: row.avatar_id,
          avatarVersion: row.avatar_updated_at,
          bio: row.bio,
        },
      ]),
    );
    const mapped: FriendLink[] = links.flatMap((row) => {
      const requesterId = Number(row.requester_id);
      const recipientId = Number(row.recipient_id);
      const otherId = requesterId === viewer.id ? recipientId : requesterId;
      const user = people.get(otherId);
      return user
        ? [
            {
              id: Number(row.id),
              requesterId,
              recipientId,
              status: row.status as FriendLink["status"],
              user,
            },
          ]
        : [];
    });
    return apiData<SocialInbox>(
      {
        realtimeTopic: socialRealtimeTopic(viewer.id),
        friends: mapped.filter((link) => link.status === "accepted"),
        incoming: mapped.filter(
          (link) => link.status === "pending" && link.recipientId === viewer.id,
        ),
        outgoing: mapped.filter(
          (link) => link.status === "pending" && link.requesterId === viewer.id,
        ),
        unreadCount: unreadResult.count ?? 0,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error, "Không thể tải danh sách bằng hữu.");
  }
}
