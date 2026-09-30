import { requestApi } from "@/lib/api-client";
import { apiMode } from "@/lib/config";
import { readStorage, writeStorage } from "@/lib/client-storage";
import type { HistoryItem } from "@/lib/app-types";
import type { CommentPage, MovieComment } from "@/lib/comments";

export type ViewerLibrary = { favorites: number[]; history: HistoryItem[]; follows: number[] };

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

  async movieFollows(): Promise<number[]> {
    return requestApi<number[]>("/me/follows", { cache: "no-store" });
  },

  async setMovieFollow(movieId: number, following: boolean) {
    await requestApi(following ? "/me/follows" : `/me/follows?movieId=${movieId}`, {
      method: following ? "POST" : "DELETE",
      body: following ? JSON.stringify({ movieId }) : undefined,
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

  async addComment(
    movieId: number,
    body: string,
    authorName: string,
    avatarId?: string,
    avatarVersion?: string | null,
    parentId?: number | null,
  ) {
    if (apiMode === "mock") {
      const comment: MovieComment = {
        id: Date.now(),
        movieId,
        authorId: 1,
        authorName,
        avatarId,
        avatarVersion,
        parentId: parentId ?? null,
        likeCount: 0,
        liked: false,
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
      body: JSON.stringify({ body, parentId }),
    });
  },

  async setCommentLike(movieId: number, commentId: number, liked: boolean) {
    if (apiMode === "mock") {
      const comments = readStorage<MovieComment[]>(
        mockCommentsKey(movieId),
        [],
      );
      const next = comments.map((item) =>
        item.id === commentId
          ? {
              ...item,
              liked,
              likeCount: Math.max(0, (item.likeCount ?? 0) + (liked ? 1 : -1)),
            }
          : item,
      );
      writeStorage(mockCommentsKey(movieId), next);
      const comment = next.find((item) => item.id === commentId);
      return { liked, likeCount: comment?.likeCount ?? 0 };
    }
    return requestApi<{ liked: boolean; likeCount: number }>(
      `/comments/${commentId}/like`,
      { method: liked ? "PUT" : "DELETE" },
    );
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
