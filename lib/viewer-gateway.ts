import { requestApi } from "@/lib/api-client";
import { apiMode } from "@/lib/config";
import { readStorage, writeStorage } from "@/lib/client-storage";
import type { HistoryItem } from "@/lib/app-types";
import type { CommentPage, MovieComment } from "@/lib/comments";

export type ViewerLibrary = { favorites: number[]; history: HistoryItem[] };

const mockCommentsKey = (movieId: number) => `viufilm3d-comments-${movieId}`;
const pendingHistorySaves = new Map<number, Promise<unknown>>();

export const viewerGateway = {
  async library(): Promise<ViewerLibrary> {
    return requestApi<ViewerLibrary>("/me/library", { cache: "no-store" });
  },

  async setFavorite(movieId: number, favorite: boolean) {
    await requestApi(`/me/favorites/${movieId}`, {
      method: favorite ? "PUT" : "DELETE",
    });
  },

  async saveHistory(item: HistoryItem) {
    const previous = pendingHistorySaves.get(item.movieId) ?? Promise.resolve();
    const next = previous
      .catch(() => undefined)
      .then(() =>
        requestApi("/me/history", {
          method: "POST",
          body: JSON.stringify({
            movieId: item.movieId,
            episode: item.episode,
            progress: item.progress,
            positionSeconds: item.positionSeconds ?? 0,
            durationSeconds: item.durationSeconds ?? 0,
          }),
        }),
      );
    pendingHistorySaves.set(item.movieId, next);
    try {
      await next;
    } finally {
      if (pendingHistorySaves.get(item.movieId) === next) {
        pendingHistorySaves.delete(item.movieId);
      }
    }
  },

  async clearHistory() {
    await Promise.allSettled([...pendingHistorySaves.values()]);
    await requestApi("/me/history", { method: "DELETE" });
  },

  async comments(movieId: number, offset = 0): Promise<CommentPage> {
    if (apiMode === "mock") {
      const items = readStorage<MovieComment[]>(mockCommentsKey(movieId), []);
      return {
        items: items.slice(offset, offset + 20),
        hasMore: items.length > offset + 20,
      };
    }
    return requestApi<CommentPage>(
      `/movies/${movieId}/comments?offset=${offset}`,
      {
        cache: "no-store",
      },
    );
  },

  async addComment(movieId: number, body: string, authorName: string) {
    if (apiMode === "mock") {
      const comment: MovieComment = {
        id: Date.now(),
        movieId,
        authorId: 1,
        authorName,
        body,
        createdAt: new Date().toISOString(),
        mine: true,
      };
      writeStorage(mockCommentsKey(movieId), [
        comment,
        ...readStorage<MovieComment[]>(mockCommentsKey(movieId), []),
      ]);
      return comment;
    }
    return requestApi<MovieComment>(`/movies/${movieId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  },

  async removeComment(movieId: number, commentId: number) {
    if (apiMode === "mock") {
      writeStorage(
        mockCommentsKey(movieId),
        readStorage<MovieComment[]>(mockCommentsKey(movieId), []).filter(
          (item) => item.id !== commentId,
        ),
      );
      return;
    }
    await requestApi(`/comments/${commentId}`, { method: "DELETE" });
  },
};
