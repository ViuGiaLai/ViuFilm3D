import { cookies } from "next/headers";
import { movieRepository } from "@/lib/server/movie-repository";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import { ValidationError } from "@/lib/server/errors";

type ViewRouteContext = { params: Promise<{ id: string }> };

const PLAYBACK_KEY_PATTERN = /^(trailer|episode-[1-9]\d*)$/;
const VIEWER_COOKIE = "viufilm_viewer";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const readMovieId = async (context: ViewRouteContext) => {
  const { id } = await context.params;
  const parsed = Number(id);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new ValidationError("Mã phim không hợp lệ.");
  }
  return parsed;
};

export async function POST(request: Request, context: ViewRouteContext) {
  try {
    const movieId = await readMovieId(context);
    const body = (await request.json()) as { playbackKey?: unknown };
    const playbackKey =
      typeof body.playbackKey === "string" ? body.playbackKey : "";

    if (!PLAYBACK_KEY_PATTERN.test(playbackKey)) {
      return apiProblem("Phiên xem không hợp lệ.", 400);
    }

    const cookieStore = await cookies();
    const currentMovie = await movieRepository.find(movieId);
    if (!currentMovie) return apiProblem("Không tìm thấy phim.", 404);

    const storedViewerId = cookieStore.get(VIEWER_COOKIE)?.value ?? "";
    const viewerId = UUID_PATTERN.test(storedViewerId)
      ? storedViewerId
      : crypto.randomUUID();

    const result = await movieRepository.recordView(
      movieId,
      playbackKey,
      viewerId,
    );
    const response = apiData(result);
    if (!UUID_PATTERN.test(storedViewerId)) {
      response.cookies.set(VIEWER_COOKIE, viewerId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 365 * 24 * 60 * 60,
      });
    }
    return response;
  } catch (error) {
    return apiError(error, "Không thể ghi nhận lượt xem.");
  }
}
