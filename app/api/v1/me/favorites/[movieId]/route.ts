import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getViewerIdentity } from "@/lib/server/viewer-session";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";

type Context = { params: Promise<{ movieId: string }> };

async function changeFavorite(context: Context, add: boolean) {
  try {
    const viewer = await getViewerIdentity();
    if (!viewer) return apiProblem("Vui lòng đăng nhập.", 401);
    const movieId = Number((await context.params).movieId);
    if (!Number.isSafeInteger(movieId) || movieId <= 0) {
      return apiProblem("Mã phim không hợp lệ.", 400);
    }
    const db = createSupabaseAdminClient();
    const result = add
      ? await db
          .from("viewer_favorites")
          .upsert(
            { user_id: viewer.id, movie_id: movieId },
            { onConflict: "user_id,movie_id" },
          )
      : await db
          .from("viewer_favorites")
          .delete()
          .eq("user_id", viewer.id)
          .eq("movie_id", movieId);
    if (result.error) throw result.error;
    return apiData({ favorite: add });
  } catch (error) {
    return apiError(error, "Không thể cập nhật phim yêu thích.");
  }
}

export function PUT(_request: Request, context: Context) {
  return changeFavorite(context, true);
}

export function DELETE(_request: Request, context: Context) {
  return changeFavorite(context, false);
}
