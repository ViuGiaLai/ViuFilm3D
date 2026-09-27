import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getViewerIdentity } from "@/lib/server/viewer-session";
import { getAdminSession } from "@/lib/server/admin-session";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import { ValidationError } from "@/lib/server/errors";
import type { CommentPage, MovieComment } from "@/lib/comments";

type Context = { params: Promise<{ id: string }> };

async function movieIdFrom(context: Context) {
  const id = Number((await context.params).id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ValidationError("Mã phim không hợp lệ.");
  }
  return id;
}

async function getAdminCommentAuthor(email: string) {
  const db = createSupabaseAdminClient();
  const findProfile = () =>
    db
      .from("app_users")
      .select("id,name,role,status")
      .eq("email", email)
      .maybeSingle();
  let { data: profile, error } = await findProfile();
  if (error) throw error;

  if (!profile) {
    const { error: insertError } = await db.from("app_users").insert({
      name: "Quản trị viên",
      email,
      role: "admin",
      status: "Đang hoạt động",
      plan: "Miễn phí",
      joined_at: new Date().toISOString().slice(0, 10),
      last_active: new Date().toISOString(),
      watches: 0,
    });
    if (insertError && insertError.code !== "23505") throw insertError;
    ({ data: profile, error } = await findProfile());
    if (error) throw error;
  }

  if (
    !profile ||
    profile.role !== "admin" ||
    profile.status !== "Đang hoạt động"
  ) {
    return null;
  }
  return { id: Number(profile.id), name: profile.name };
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
      .select("id,movie_id,user_id,body,created_at,app_users(name)")
      .eq("movie_id", movieId)
      .eq("status", "visible")
      .order("created_at", { ascending: false })
      .range(offset, offset + 20);

    if (error) throw error;
    const admin = await getAdminSession();
    const viewer = admin ? null : await getViewerIdentity().catch(() => null);
    const comments: MovieComment[] = (data ?? []).slice(0, 20).map((row) => {
      const author = row.app_users as unknown as { name: string } | null;
      return {
        id: Number(row.id),
        movieId: Number(row.movie_id),
        authorId: Number(row.user_id),
        authorName: author?.name ?? "Người xem",
        body: row.body,
        createdAt: row.created_at,
        mine: Boolean(admin) || viewer?.id === Number(row.user_id),
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
    const admin = await getAdminSession();
    const viewer = admin ? null : await getViewerIdentity();
    if (!admin && !viewer)
      return apiProblem("Vui lòng đăng nhập để bình luận.", 401);
    const author = admin
      ? await getAdminCommentAuthor(admin.email)
      : { id: viewer!.id, name: viewer!.account.name };
    if (!author) {
      return apiProblem(
        "Email quản trị đang được dùng bởi tài khoản người xem hoặc đã bị khóa.",
        409,
      );
    }
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
      .insert({ movie_id: movieId, user_id: author.id, body: content })
      .select("id,created_at")
      .single();
    if (error) throw error;

    return apiData<MovieComment>(
      {
        id: Number(data.id),
        movieId,
        authorId: author.id,
        authorName: author.name,
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
