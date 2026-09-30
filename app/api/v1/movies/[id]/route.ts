import { movieRepository } from "@/lib/server/movie-repository";
import { parseMovie } from "@/lib/server/movie-validation";
import { hasAdminSession } from "@/lib/server/admin-session";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import { ValidationError } from "@/lib/server/errors";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { notifyUserNotifications } from "@/lib/server/realtime-notify";

type MovieRouteContext = { params: Promise<{ id: string }> };

const readId = async (context: MovieRouteContext) => {
  const { id } = await context.params;
  const parsed = Number(id);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new ValidationError("Mã phim không hợp lệ.");
  }
  return parsed;
};

export async function GET(_: Request, context: MovieRouteContext) {
  try {
    const id = await readId(context);
    const movie = await movieRepository.find(id);
    return movie ? apiData(movie) : apiProblem("Không tìm thấy phim.", 404);
  } catch (error) {
    return apiError(error, "Không thể tải thông tin phim.");
  }
}

export async function PUT(request: Request, context: MovieRouteContext) {
  if (!(await hasAdminSession())) {
    return apiProblem("Bạn không có quyền thay đổi kho phim.", 401);
  }
  try {
    const id = await readId(context);
    const movie = parseMovie(await request.json());

    if (movie.id !== id) {
      return apiProblem("Mã phim trên URL và nội dung không khớp.", 400);
    }

    const oldMovie = await movieRepository.find(id);
    const savedMovie = await movieRepository.save(movie);

    if (oldMovie && savedMovie.episode > oldMovie.episode) {
      const db = createSupabaseAdminClient();
      const { data } = await db
        .from("movie_follows")
        .select("user_id")
        .eq("movie_id", id)
        .eq("notify_new_episode", true);

      if (data && data.length > 0) {
        const userIds = data.map((d) => Number(d.user_id));
        const notifications = userIds.map((userId) => ({
          user_id: userId,
          type: "new_episode",
          content: `Phim ${savedMovie.title} vừa cập nhật tập ${savedMovie.episode}!`,
          link: `/phim/${savedMovie.slug}`,
        }));
        await db.from("notifications").insert(notifications);
        // Avoid awaiting the broadcast so it doesn't block the request
        notifyUserNotifications(userIds).catch(console.error);
      }
    }

    return apiData(savedMovie);
  } catch (error) {
    return apiError(error, "Không thể lưu phim.");
  }
}

export async function DELETE(_: Request, context: MovieRouteContext) {
  if (!(await hasAdminSession())) {
    return apiProblem("Bạn không có quyền thay đổi kho phim.", 401);
  }
  try {
    const id = await readId(context);
    return (await movieRepository.remove(id))
      ? apiData(null)
      : apiProblem("Không tìm thấy phim.", 404);
  } catch (error) {
    return apiError(error, "Không thể xóa phim.");
  }
}
