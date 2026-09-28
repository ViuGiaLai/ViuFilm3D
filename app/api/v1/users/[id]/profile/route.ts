import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getSocialIdentity } from "@/lib/server/social-identity";
import { findFriendLink } from "@/lib/server/social-repository";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import type { PublicProfile } from "@/lib/social-types";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const publicId = (await context.params).id;
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        publicId,
      )
    ) {
      return apiProblem("Người dùng không hợp lệ.", 400);
    }
    const db = createSupabaseAdminClient();
    const { data: user, error } = await db
      .from("app_users")
      .select(
        "id,public_id,cultivation_xp,avatar_frame_id,name,avatar_id,avatar_updated_at,bio,joined_at,role,status",
      )
      .eq("public_id", publicId)
      .maybeSingle();
    if (error) throw error;
    if (!user || user.status !== "Đang hoạt động") {
      return apiProblem("Không tìm thấy hồ sơ này.", 404);
    }
    const id = Number(user.id);

    const [countResult, commentResult, followersResult, followingResult] =
      await Promise.all([
        db
          .from("movie_comments")
          .select("id", { count: "exact", head: true })
          .eq("user_id", id)
          .eq("status", "visible"),
        db
          .from("movie_comments")
          .select("id,movie_id,body,created_at,movies(title,slug)")
          .eq("user_id", id)
          .eq("status", "visible")
          .order("created_at", { ascending: false })
          .limit(10),
        db
          .from("user_follows")
          .select("follower_id", { count: "exact", head: true })
          .eq("followed_id", id),
        db
          .from("user_follows")
          .select("followed_id", { count: "exact", head: true })
          .eq("follower_id", id),
      ]);
    if (countResult.error) throw countResult.error;
    if (commentResult.error) throw commentResult.error;
    if (followersResult.error) throw followersResult.error;
    if (followingResult.error) throw followingResult.error;

    const viewer = await getSocialIdentity().catch(() => null);
    let relation: PublicProfile["relation"] = "none";
    let relationLinkId: number | null = null;
    let following = false;
    if (viewer?.id === id) relation = "self";
    else if (viewer) {
      const [link, follow] = await Promise.all([
        findFriendLink(viewer.id, id),
        db
          .from("user_follows")
          .select("follower_id")
          .eq("follower_id", viewer.id)
          .eq("followed_id", id)
          .maybeSingle(),
      ]);
      if (follow.error) throw follow.error;
      following = Boolean(follow.data);
      relationLinkId = link ? Number(link.id) : null;
      if (link?.status === "accepted") relation = "friends";
      else if (link?.requester_id === viewer.id) relation = "sent";
      else if (link?.recipient_id === viewer.id) relation = "received";
    }

    return apiData<PublicProfile>(
      {
        id,
        publicId: user.public_id,
        cultivationXp: Number(user.cultivation_xp ?? 0),
        avatarFrameId: user.avatar_frame_id,
        name: user.name,
        avatarId: user.avatar_id,
        avatarVersion: user.avatar_updated_at,
        bio: user.bio,
        joinedAt: user.joined_at,
        role: user.role,
        commentCount: countResult.count ?? 0,
        followersCount: followersResult.count ?? 0,
        followingCount: followingResult.count ?? 0,
        following,
        relation,
        relationLinkId,
        comments: (commentResult.data ?? []).map((row) => {
          const movie = row.movies as unknown as {
            title: string;
            slug: string;
          } | null;
          return {
            id: Number(row.id),
            movieId: Number(row.movie_id),
            movieSlug: movie?.slug ?? "",
            movieTitle: movie?.title ?? "Phim đã xóa",
            body: row.body,
            createdAt: row.created_at,
          };
        }),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error, "Không thể tải hồ sơ.");
  }
}
