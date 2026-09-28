import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { hasAdminSession } from "@/lib/server/admin-session";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import type { ModerationComment } from "@/lib/comments";

export async function GET(request: Request) {
  if (!(await hasAdminSession()))
    return apiProblem("Không có quyền quản lý bình luận.", 401);
  try {
    const params = new URL(request.url).searchParams;
    const offset = Number(params.get("offset") ?? 0);
    const status = params.get("status") ?? "all";
    const keyword = (params.get("q") ?? "").trim();
    if (
      !Number.isSafeInteger(offset) ||
      offset < 0 ||
      !["all", "visible", "hidden"].includes(status) ||
      keyword.length > 100
    ) {
      return apiProblem("Bộ lọc bình luận không hợp lệ.", 400);
    }
    let query = createSupabaseAdminClient()
      .from("movie_comments")
      .select(
        "id,movie_id,user_id,body,status,created_at,movies(title),app_users!movie_comments_user_id_fkey(name,email)",
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
    if (status !== "all") query = query.eq("status", status);
    if (keyword)
      query = query.ilike("body", `%${keyword.replace(/[%_\\]/g, "\\$&")}%`);
    const { data, error } = await query.range(offset, offset + 50);
    if (error) throw error;
    const comments: ModerationComment[] = (data ?? [])
      .slice(0, 50)
      .map((row) => {
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
    return apiData({ items: comments, hasMore: (data?.length ?? 0) > 50 });
  } catch (error) {
    return apiError(error, "Không thể tải bình luận.");
  }
}
