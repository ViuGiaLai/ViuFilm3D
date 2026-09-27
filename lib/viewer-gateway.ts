import { requestApi } from "@/lib/api-client";
import { apiMode } from "@/lib/config";
import { readStorage, writeStorage } from "@/lib/client-storage";
import type { HistoryItem } from "@/lib/app-types";
import type { MovieComment } from "@/lib/comments";

export type ViewerLibrary = { favorites: number[]; history: HistoryItem[] };

const mockCommentsKey = (movieId: number) => `viufilm3d-comments-${movieId}`;

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
    await requestApi("/me/history", {
      method: "POST",
      body: JSON.stringify({
        movieId: item.movieId,
        episode: item.episode,
        progress: item.progress,
        positionSeconds: item.positionSeconds ?? 0,
        durationSeconds: item.durationSeconds ?? 0,
      }),
    });
  },

  async clearHistory() {
    await requestApi("/me/history", { method: "DELETE" });
  },

  async comments(movieId: number): Promise<MovieComment[]> {
    if (apiMode === "mock") {
      return readStorage<MovieComment[]>(mockCommentsKey(movieId), []);
    }
    return requestApi<MovieComment[]>(`/movies/${movieId}/comments`, {
      cache: "no-store",
    });
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
        ...(await this.comments(movieId)),
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
        (await this.comments(movieId)).filter((item) => item.id !== commentId),
      );
      return;
    }
    await requestApi(`/comments/${commentId}`, { method: "DELETE" });
  },
};
