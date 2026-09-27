import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getViewerIdentity } from "@/lib/server/viewer-session";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import { ValidationError } from "@/lib/server/errors";
import type { MovieComment } from "@/lib/comments";

type Context = { params: Promise<{ id: string }> };

async function movieIdFrom(context: Context) {
  const id = Number((await context.params).id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ValidationError("Mã phim không hợp lệ.");
  }
  return id;
}

export async function GET(_request: Request, context: Context) {
  try {
    const movieId = await movieIdFrom(context);
    const db = createSupabaseAdminClient();
    const { data, error } = await db
      .from("movie_comments")
      .select("id,movie_id,user_id,body,created_at,app_users(name)")
      .eq("movie_id", movieId)
      .eq("status", "visible")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    const viewer = await getViewerIdentity().catch(() => null);
    const comments: MovieComment[] = (data ?? []).map((row) => {
      const author = row.app_users as unknown as { name: string } | null;
      return {
        id: Number(row.id),
        movieId: Number(row.movie_id),
        authorId: Number(row.user_id),
        authorName: author?.name ?? "Người xem",
        body: row.body,
        createdAt: row.created_at,
        mine: viewer?.id === Number(row.user_id),
      };
    });
    return apiData(comments, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return apiError(error, "Không thể tải bình luận.");
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const viewer = await getViewerIdentity();
    if (!viewer) return apiProblem("Vui lòng đăng nhập để bình luận.", 401);
    const movieId = await movieIdFrom(context);
    const body = (await request.json()) as { body?: unknown };
    const content = typeof body.body === "string" ? body.body.trim() : "";
    if (content.length < 2 || content.length > 1000) {
      throw new ValidationError("Bình luận cần từ 2 đến 1000 ký tự.");
    }

    const db = createSupabaseAdminClient();
    const { data: last, error: lastError } = await db
      .from("movie_comments")
      .select("created_at")
      .eq("user_id", viewer.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lastError) throw lastError;
    if (last && Date.now() - Date.parse(last.created_at) < 15_000) {
      return apiProblem("Vui lòng đợi vài giây trước khi bình luận tiếp.", 429);
    }

    const { data, error } = await db
      .from("movie_comments")
      .insert({ movie_id: movieId, user_id: viewer.id, body: content })
      .select("id,created_at")
      .single();
    if (error) throw error;

    return apiData<MovieComment>(
      {
        id: Number(data.id),
        movieId,
        authorId: viewer.id,
        authorName: viewer.account.name,
        body: content,
        createdAt: data.created_at,
        mine: true,
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error, "Không thể gửi bình luận.");
  }
}
