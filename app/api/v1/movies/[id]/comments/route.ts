import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getViewerIdentity } from "@/lib/server/viewer-session";
import { getAdminSession } from "@/lib/server/admin-session";
import { getSocialIdentity } from "@/lib/server/social-identity";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import { ValidationError } from "@/lib/server/errors";
import { notifyComments } from "@/lib/server/realtime-notify";
import type { CommentPage, MovieComment } from "@/lib/comments";

type Context = { params: Promise<{ id: string }> };

async function movieIdFrom(context: Context) {
  const id = Number((await context.params).id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ValidationError("Mã phim không hợp lệ.");
  }
  return id;
}

export async function GET(request: Request, context: Context) {
  try {
    const movieId = await movieIdFrom(context);
    const rawOffset = Number(
      new URL(request.url).searchParams.get("offset") ?? 0,
    );
    const offset =
      Number.isSafeInteger(rawOffset) && rawOffset >= 0 && rawOffset <= 5000
        ? rawOffset
        : 0;
    const db = createSupabaseAdminClient();
    const { data, error } = await db
      .from("movie_comments")
      .select(
        "id,movie_id,user_id,parent_id,like_count,body,created_at,app_users!movie_comments_user_id_fkey(*)",
      )
      .eq("movie_id", movieId)
      .eq("status", "visible")
      .order("created_at", { ascending: false })
      .range(offset, offset + 20);

    if (error) throw error;
    const admin = await getAdminSession();
    const viewer = admin ? null : await getViewerIdentity().catch(() => null);
    const currentId = admin
      ? (await getSocialIdentity().catch(() => null))?.id
      : viewer?.id;
    const visibleRows = (data ?? []).slice(0, 20);
    const likes =
      currentId && visibleRows.length
        ? await db
            .from("movie_comment_likes")
            .select("comment_id")
            .eq("user_id", currentId)
            .in(
              "comment_id",
              visibleRows.map((row) => row.id),
            )
        : { data: [], error: null };
    if (likes.error) throw likes.error;
    const likedIds = new Set(
      (likes.data ?? []).map((row) => Number(row.comment_id)),
    );
    const comments: MovieComment[] = visibleRows.map((row) => {
      const author = row.app_users as unknown as {
        name: string;
        public_id: string;
        cultivation_xp: number;
        avatar_frame_id: string;
        avatar_id: string;
        avatar_updated_at: string | null;
      } | null;
      return {
        id: Number(row.id),
        movieId: Number(row.movie_id),
        authorId: Number(row.user_id),
        authorPublicId: author?.public_id,
        authorCultivationXp: Number(author?.cultivation_xp ?? 0),
        authorFrameId: author?.avatar_frame_id,
        authorName: author?.name ?? "Người xem",
        avatarId: author?.avatar_id,
        avatarVersion: author?.avatar_updated_at,
        body: row.body,
        parentId: row.parent_id ? Number(row.parent_id) : null,
        likeCount: Number(row.like_count ?? 0),
        liked: likedIds.has(Number(row.id)),
        createdAt: row.created_at,
        mine: currentId === Number(row.user_id),
      };
    });
    return apiData<CommentPage>(
      { items: comments, hasMore: (data?.length ?? 0) > 20 },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    return apiError(error, "Không thể tải bình luận.");
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const author = await getSocialIdentity();
    if (!author) return apiProblem("Vui lòng đăng nhập để bình luận.", 401);
    const movieId = await movieIdFrom(context);
    const body = (await request.json()) as {
      body?: unknown;
      parentId?: unknown;
    };
    const content = typeof body.body === "string" ? body.body.trim() : "";
    const parentId = body.parentId == null ? null : Number(body.parentId);
    if (content.length < 2 || content.length > 1000) {
      throw new ValidationError("Bình luận cần từ 2 đến 1000 ký tự.");
    }
    if (
      parentId !== null &&
      (!Number.isSafeInteger(parentId) || parentId <= 0)
    ) {
      return apiProblem("Bình luận được phản hồi không hợp lệ.", 400);
    }

    const db = createSupabaseAdminClient();
    if (parentId !== null) {
      const parent = await db
        .from("movie_comments")
        .select("id")
        .eq("id", parentId)
        .eq("movie_id", movieId)
        .eq("status", "visible")
        .maybeSingle();
      if (parent.error) throw parent.error;
      if (!parent.data) {
        return apiProblem("Bình luận được phản hồi không còn tồn tại.", 404);
      }
    }
    const { data: last, error: lastError } = await db
      .from("movie_comments")
      .select("created_at")
      .eq("user_id", author.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lastError) throw lastError;
    if (last && Date.now() - Date.parse(last.created_at) < 15_000) {
      return apiProblem("Vui lòng đợi vài giây trước khi bình luận tiếp.", 429);
    }

    const { data, error } = await db
      .from("movie_comments")
      .insert({
        movie_id: movieId,
        user_id: author.id,
        parent_id: parentId,
        body: content,
      })
      .select("id,created_at")
      .single();
    if (error) throw error;

    const { data: updatedAuthor } = await db
      .from("app_users")
      .select("cultivation_xp,avatar_frame_id")
      .eq("id", author.id)
      .single();
    await notifyComments(movieId);

    return apiData<MovieComment>(
      {
        id: Number(data.id),
        movieId,
        authorId: author.id,
        authorPublicId: author.account.publicId,
        authorCultivationXp: Number(
          updatedAuthor?.cultivation_xp ?? author.account.cultivationXp ?? 0,
        ),
        authorFrameId:
          updatedAuthor?.avatar_frame_id ?? author.account.avatarFrameId,
        authorName: author.account.name,
        avatarId: author.account.avatarId,
        avatarVersion: author.account.avatarVersion,
        body: content,
        parentId,
        likeCount: 0,
        liked: false,
        createdAt: data.created_at,
        mine: true,
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error, "Không thể gửi bình luận.");
  }
}
