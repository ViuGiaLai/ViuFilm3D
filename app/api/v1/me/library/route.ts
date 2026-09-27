import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getViewerIdentity } from "@/lib/server/viewer-session";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import type { HistoryItem } from "@/lib/app-types";

export async function GET() {
  try {
    const viewer = await getViewerIdentity();
    if (!viewer) return apiProblem("Vui lòng đăng nhập.", 401);
    const db = createSupabaseAdminClient();
    const [favorites, history] = await Promise.all([
      db.from("viewer_favorites").select("movie_id").eq("user_id", viewer.id),
      db
        .from("viewer_history")
        .select(
          "movie_id,episode,progress,position_seconds,duration_seconds,watched_at",
        )
        .eq("user_id", viewer.id)
        .order("watched_at", { ascending: false })
        .limit(50),
    ]);
    if (favorites.error) throw favorites.error;
    if (history.error) throw history.error;
    return apiData({
      favorites: (favorites.data ?? []).map((row) => Number(row.movie_id)),
      history: (history.data ?? []).map((row): HistoryItem => ({
        movieId: Number(row.movie_id),
        episode: Number(row.episode),
        progress: Number(row.progress),
        positionSeconds: Number(row.position_seconds),
        durationSeconds: Number(row.duration_seconds),
        watchedAt: row.watched_at,
      })),
    });
  } catch (error) {
    return apiError(error, "Không thể tải thư viện cá nhân.");
  }
}
