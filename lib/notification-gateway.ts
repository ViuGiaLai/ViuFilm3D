import { requestApi } from "@/lib/api-client";

export type NotificationItem = {
  id: number;
  type: string;
  content: string;
  link?: string;
  is_read: boolean;
  created_at: string;
};

export type NotificationInbox = {
  items: NotificationItem[];
  unreadCount: number;
  realtimeTopic: string;
};

export const notificationGateway = {
  inbox() {
    return requestApi<NotificationInbox>("/me/notifications", {
      cache: "no-store",
    });
  },
  markAsRead(id?: number) {
    return requestApi("/me/notifications", {
      method: "PATCH",
      body: JSON.stringify({ id }),
    });
  },
};
