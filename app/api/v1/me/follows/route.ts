import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getViewerIdentity } from "@/lib/server/viewer-session";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";

export async function GET() {
  try {
    const viewer = await getViewerIdentity();
    if (!viewer) return apiProblem("Vui lòng đăng nhập.", 401);
    
    const db = createSupabaseAdminClient();
    const { data, error } = await db
      .from("movie_follows")
      .select("movie_id")
      .eq("user_id", viewer.id);
      
    if (error) throw error;
    
    return apiData(data.map((d) => Number(d.movie_id)));
  } catch (error) {
    return apiError(error, "Không thể lấy danh sách phim theo dõi.");
  }
}

export async function POST(request: Request) {
  try {
    const viewer = await getViewerIdentity();
    if (!viewer) return apiProblem("Vui lòng đăng nhập.", 401);
    
    const body = await request.json().catch(() => ({}));
    const movieId = Number(body.movieId);
    
    if (!Number.isSafeInteger(movieId) || movieId <= 0) {
      return apiProblem("ID phim không hợp lệ.", 400);
    }
    
    const { error } = await createSupabaseAdminClient()
      .from("movie_follows")
      .upsert({ user_id: viewer.id, movie_id: movieId }, { onConflict: "user_id,movie_id" });
      
    if (error) throw error;
    return apiData({ success: true });
  } catch (error) {
    return apiError(error, "Không thể theo dõi phim.");
  }
}

export async function DELETE(request: Request) {
  try {
    const viewer = await getViewerIdentity();
    if (!viewer) return apiProblem("Vui lòng đăng nhập.", 401);
    
    const { searchParams } = new URL(request.url);
    const movieId = Number(searchParams.get("movieId"));
    
    if (!Number.isSafeInteger(movieId) || movieId <= 0) {
      return apiProblem("ID phim không hợp lệ.", 400);
    }
    
    const { error } = await createSupabaseAdminClient()
      .from("movie_follows")
      .delete()
      .eq("user_id", viewer.id)
      .eq("movie_id", movieId);
      
    if (error) throw error;
    return apiData({ success: true });
  } catch (error) {
    return apiError(error, "Không thể bỏ theo dõi phim.");
  }
}
