import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { hasAdminSession } from "@/lib/server/admin-session";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import type { ModerationComment } from "@/lib/comments";

export async function GET() {
  if (!(await hasAdminSession()))
    return apiProblem("Không có quyền quản lý bình luận.", 401);
  try {
    const { data, error } = await createSupabaseAdminClient()
      .from("movie_comments")
      .select(
        "id,movie_id,user_id,body,status,created_at,movies(title),app_users(name,email)",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    const comments: ModerationComment[] = (data ?? []).map((row) => {
      const movie = row.movies as unknown as { title: string } | null;
      const author = row.app_users as unknown as {
        name: string;
        email: string;
      } | null;
      return {
        id: Number(row.id),
        movieId: Number(row.movie_id),
        authorId: Number(row.user_id),
        authorName: author?.name ?? "Người xem",
        authorEmail: author?.email ?? "",
        movieTitle: movie?.title ?? "Phim đã xóa",
        body: row.body,
        status: row.status as "visible" | "hidden",
        createdAt: row.created_at,
        mine: false,
      };
    });
    return apiData(comments);
  } catch (error) {
    return apiError(error, "Không thể tải bình luận.");
  }
}
