import { movieSeed, type Movie } from "@/lib/movies";
import { requestApi } from "@/lib/api-client";
import { apiMode } from "@/lib/config";
import { readStorage, storageKeys, writeStorage } from "@/lib/client-storage";

const cloneSeed = () => movieSeed.map((movie) => ({ ...movie }));

const readMockMovies = (): Movie[] => {
  if (typeof window === "undefined")
    return cloneSeed().sort((a, b) => b.id - a.id);

  try {
    const saved = readStorage<Movie[] | null>(storageKeys.movies, null);
    if (saved) return [...saved].sort((a, b) => b.id - a.id);
  } catch {
    // Dữ liệu hỏng sẽ được thay bằng bộ dữ liệu mẫu bên dưới.
  }

  const initialMovies = cloneSeed().sort((a, b) => b.id - a.id);
  writeStorage(storageKeys.movies, initialMovies);
  return initialMovies;
};

const writeMockMovies = (movies: Movie[]) => {
  writeStorage(storageKeys.movies, movies);
};

export type ViewReceipt = {
  views: number;
  counted: boolean;
};

const VIEW_WINDOW_MS = 6 * 60 * 60 * 1000;

const viewStorageKey = (movieId: number, playbackKey: string) =>
  `viufilm3d-view-${movieId}-${playbackKey}`;

export const movieGateway = {
  mode: apiMode,

  async list(): Promise<Movie[]> {
    const movies =
      apiMode === "mock"
        ? readMockMovies()
        : await requestApi<Movie[]>("/movies", { cache: "no-store" });
    return [...movies].sort((a, b) => b.id - a.id);
  },

  async recordView(
    movieId: number,
    playbackKey: string,
  ): Promise<ViewReceipt> {
    if (apiMode === "mock") {
      const movies = readMockMovies();
      const movie = movies.find((item) => item.id === movieId);
      if (!movie) throw new Error("Không tìm thấy phim để ghi nhận lượt xem.");

      const key = viewStorageKey(movieId, playbackKey);
      const lastCountedAt = Number(localStorage.getItem(key) || 0);
      if (Date.now() - lastCountedAt < VIEW_WINDOW_MS) {
        return { views: movie.views, counted: false };
      }

      const views = movie.views + 1;
      writeMockMovies(
        movies.map((item) =>
          item.id === movieId ? { ...item, views } : item,
        ),
      );
      localStorage.setItem(key, String(Date.now()));
      return { views, counted: true };
    }

    return requestApi<ViewReceipt>(`/movies/${movieId}/view`, {
      method: "POST",
      body: JSON.stringify({ playbackKey }),
    });
  },

  async save(movie: Movie): Promise<Movie> {
    if (apiMode === "mock") {
      const movies = readMockMovies();
      const exists = movies.some((item) => item.id === movie.id);
      const next = exists
        ? movies.map((item) => (item.id === movie.id ? movie : item))
        : [movie, ...movies];
      const sorted = [...next].sort((a, b) => b.id - a.id);
      writeMockMovies(sorted);
      return movie;
    }

    return requestApi<Movie>(`/movies/${movie.id}`, {
      method: "PUT",
      body: JSON.stringify(movie),
    });
  },

  async remove(id: number): Promise<void> {
    if (apiMode === "mock") {
      writeMockMovies(readMockMovies().filter((movie) => movie.id !== id));
      return;
    }

    await requestApi<null>(`/movies/${id}`, { method: "DELETE" });
  },

  async removeMany(ids: number[]): Promise<void> {
    if (apiMode === "mock") {
      writeMockMovies(
        readMockMovies().filter((movie) => !ids.includes(movie.id)),
      );
      return;
    }

    await requestApi<null>("/movies", {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    });
  },
};
