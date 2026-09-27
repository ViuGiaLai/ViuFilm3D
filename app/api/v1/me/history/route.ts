import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getViewerIdentity } from "@/lib/server/viewer-session";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";

export async function POST(request: Request) {
  try {
    const viewer = await getViewerIdentity();
    if (!viewer) return apiProblem("Vui lòng đăng nhập.", 401);
    const body = (await request.json()) as Record<string, unknown>;
    const movieId = Number(body.movieId);
    const episode = Number(body.episode);
    const progress = Number(body.progress);
    const positionSeconds = Number(body.positionSeconds ?? 0);
    const durationSeconds = Number(body.durationSeconds ?? 0);
    if (
      !Number.isSafeInteger(movieId) ||
      movieId <= 0 ||
      !Number.isSafeInteger(episode) ||
      episode <= 0 ||
      !Number.isInteger(progress) ||
      progress < 0 ||
      progress > 100 ||
      !Number.isSafeInteger(positionSeconds) ||
      positionSeconds < 0 ||
      !Number.isSafeInteger(durationSeconds) ||
      durationSeconds < 0
    ) {
      return apiProblem("Tiến độ xem không hợp lệ.", 400);
    }
    const { error } = await createSupabaseAdminClient()
      .from("viewer_history")
      .upsert(
        {
          user_id: viewer.id,
          movie_id: movieId,
          episode,
          progress,
          position_seconds: positionSeconds,
          duration_seconds: durationSeconds,
          watched_at: new Date().toISOString(),
        },
        { onConflict: "user_id,movie_id" },
      );
    if (error) throw error;
    return apiData({ saved: true });
  } catch (error) {
    return apiError(error, "Không thể lưu lịch sử xem.");
  }
}

export async function DELETE() {
  try {
    const viewer = await getViewerIdentity();
    if (!viewer) return apiProblem("Vui lòng đăng nhập.", 401);
    const { error } = await createSupabaseAdminClient()
      .from("viewer_history")
      .delete()
      .eq("user_id", viewer.id);
    if (error) throw error;
    return apiData({ cleared: true });
  } catch (error) {
    return apiError(error, "Không thể xóa lịch sử xem.");
  }
}
