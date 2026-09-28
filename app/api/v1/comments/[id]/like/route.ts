import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getSocialIdentity } from "@/lib/server/social-identity";
import { parsePositiveId } from "@/lib/server/social-repository";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import { notifyComments } from "@/lib/server/realtime-notify";

type Context = { params: Promise<{ id: string }> };

async function setLike(context: Context, liked: boolean) {
  try {
    const user = await getSocialIdentity();
    if (!user) return apiProblem("Vui lòng đăng nhập.", 401);
    const id = parsePositiveId((await context.params).id);
    if (!id) return apiProblem("Bình luận không hợp lệ.", 400);
    const db = createSupabaseAdminClient();
    const comment = await db
      .from("movie_comments")
      .select("id,movie_id,status")
      .eq("id", id)
      .maybeSingle();
    if (comment.error) throw comment.error;
    if (!comment.data || comment.data.status !== "visible") {
      return apiProblem("Không tìm thấy bình luận.", 404);
    }
    const changed = liked
      ? await db
          .from("movie_comment_likes")
          .upsert(
            { comment_id: id, user_id: user.id },
            { onConflict: "comment_id,user_id", ignoreDuplicates: true },
          )
      : await db
          .from("movie_comment_likes")
          .delete()
          .eq("comment_id", id)
          .eq("user_id", user.id);
    if (changed.error) throw changed.error;
    const result = await db
      .from("movie_comments")
      .select("like_count")
      .eq("id", id)
      .single();
    if (result.error) throw result.error;
    await notifyComments(Number(comment.data.movie_id));
    return apiData({ liked, likeCount: Number(result.data.like_count) });
  } catch (error) {
    return apiError(error, "Không thể cập nhật lượt thích.");
  }
}

export async function PUT(_request: Request, context: Context) {
  return setLike(context, true);
}

export async function DELETE(_request: Request, context: Context) {
  return setLike(context, false);
}
