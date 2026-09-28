import {
  defaultSettings,
  viewerSeed,
  type SiteSettings,
  type Viewer,
} from "@/lib/admin-data";
import { requestApi } from "@/lib/api-client";
import { apiMode } from "@/lib/config";
import { readStorage, storageKeys, writeStorage } from "@/lib/client-storage";
import type { ModerationComment } from "@/lib/comments";
import type { SupportProfile, WorldModeration } from "@/lib/admin-community";

export const adminGateway = {
  async supportProfile(
    id: number,
    expected: SupportProfile,
    next: SupportProfile,
    reason: string,
  ) {
    return requestApi(`/admin/users/${id}/appearance`, {
      method: "PATCH",
      body: JSON.stringify({ expected, next, reason }),
    });
  },
  async worldMessages(offset = 0, status = "all", q = "") {
    return requestApi<{ items: WorldModeration[]; hasMore: boolean }>(
      `/admin/world?${new URLSearchParams({ offset: String(offset), status, q })}`,
      { cache: "no-store" },
    );
  },
  async moderateWorld(
    id: number,
    status: "visible" | "hidden",
    reason: string,
  ) {
    return requestApi("/admin/world", {
      method: "PATCH",
      body: JSON.stringify({ id, status, reason }),
    });
  },
  async communityAudit() {
    return requestApi<
      Array<{
        id: number;
        actor_email: string;
        action: string;
        target_id: number;
        reason: string;
        created_at: string;
        before_data: Record<string, unknown>;
        after_data: Record<string, unknown>;
      }>
    >("/admin/community-audit", { cache: "no-store" });
  },
  async listComments(
    offset = 0,
    status = "all",
    keyword = "",
  ): Promise<{ items: ModerationComment[]; hasMore: boolean }> {
    if (apiMode === "mock") return { items: [], hasMore: false };
    const query = new URLSearchParams({
      offset: String(offset),
      status,
      q: keyword,
    });
    return requestApi<{ items: ModerationComment[]; hasMore: boolean }>(
      `/admin/comments?${query}`,
      {
        cache: "no-store",
      },
    );
  },

  async setCommentStatus(id: number, status: "visible" | "hidden") {
    await requestApi(`/comments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async removeComment(id: number) {
    await requestApi(`/comments/${id}`, { method: "DELETE" });
  },

  async listViewers(): Promise<Viewer[]> {
    if (apiMode === "mock") {
      const viewers = readStorage<Viewer[]>(storageKeys.viewers, viewerSeed);
      if (!localStorage.getItem(storageKeys.viewers)) {
        writeStorage(storageKeys.viewers, viewers);
      }
      return viewers;
    }
    return requestApi<Viewer[]>("/users", { cache: "no-store" });
  },

  async saveViewer(viewer: Viewer): Promise<Viewer> {
    if (apiMode === "mock") {
      const viewers = readStorage<Viewer[]>(storageKeys.viewers, viewerSeed);
      const next = viewers.some((item) => item.id === viewer.id)
        ? viewers.map((item) => (item.id === viewer.id ? viewer : item))
        : [viewer, ...viewers];
      writeStorage(storageKeys.viewers, next);
      return viewer;
    }
    return requestApi<Viewer>(`/users/${viewer.id}`, {
      method: "PUT",
      body: JSON.stringify(viewer),
    });
  },

  async removeViewer(id: number): Promise<void> {
    if (apiMode === "mock") {
      writeStorage(
        storageKeys.viewers,
        readStorage<Viewer[]>(storageKeys.viewers, viewerSeed).filter(
          (viewer) => viewer.id !== id,
        ),
      );
      return;
    }
    await requestApi<null>(`/users/${id}`, { method: "DELETE" });
  },

  async getSettings(): Promise<SiteSettings> {
    if (apiMode === "mock") {
      return {
        ...defaultSettings,
        ...readStorage<SiteSettings>(storageKeys.settings, defaultSettings),
      };
    }
    return requestApi<SiteSettings>("/settings", { cache: "no-store" });
  },

  async saveSettings(settings: SiteSettings): Promise<SiteSettings> {
    if (apiMode === "mock") {
      writeStorage(storageKeys.settings, settings);
      return settings;
    }
    return requestApi<SiteSettings>("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },
};
