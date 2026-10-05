import type { ModerationComment } from "@/lib/comments";
import type { WorldModeration } from "@/lib/admin-community";
import type { Viewer } from "@/lib/admin-data";

export type AdminDataCache = {
  comments: { items: ModerationComment[]; hasMore: boolean } | null;
  worldMessages: { items: WorldModeration[]; hasMore: boolean } | null;
  auditLogs: any[] | null;
  viewers: Viewer[] | null;
  lastFetched: {
    comments?: number;
    worldMessages?: number;
    auditLogs?: number;
    viewers?: number;
  };
};

export const adminDataCache: AdminDataCache = {
  comments: null,
  worldMessages: null,
  auditLogs: null,
  viewers: null,
  lastFetched: {},
};
