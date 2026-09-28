import { requestApi } from "@/lib/api-client";
import type {
  DirectMessage,
  PublicProfile,
  SocialInbox,
  SocialUser,
  WorldMessage,
} from "@/lib/social-types";

export const socialGateway = {
  world(before?: number) {
    return requestApi<{ items: WorldMessage[]; hasMore: boolean }>(
      `/community/world${before ? `?before=${before}` : ""}`,
      { cache: "no-store" },
    );
  },
  sendWorld(body: string) {
    return requestApi<WorldMessage>("/community/world", {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  },
  profile(id: string) {
    return requestApi<PublicProfile>(`/users/${id}/profile`, {
      cache: "no-store",
    });
  },
  search(query: string) {
    return requestApi<SocialUser[]>(
      `/community/users?q=${encodeURIComponent(query)}`,
      { cache: "no-store" },
    );
  },
  inbox() {
    return requestApi<SocialInbox>("/me/social", { cache: "no-store" });
  },
  invite(id: number) {
    return requestApi(`/users/${id}/friend`, { method: "POST" });
  },
  follow(id: number, following: boolean) {
    return requestApi(`/users/${id}/follow`, {
      method: following ? "PUT" : "DELETE",
    });
  },
  accept(id: number) {
    return requestApi(`/me/friends/${id}`, { method: "PATCH" });
  },
  remove(id: number) {
    return requestApi(`/me/friends/${id}`, { method: "DELETE" });
  },
  messages(id: number, before?: number) {
    return requestApi<DirectMessage[]>(
      `/me/messages/${id}${before ? `?before=${before}` : ""}`,
      {
        cache: "no-store",
      },
    );
  },
  sendMessage(id: number, body: string) {
    return requestApi<DirectMessage>(`/me/messages/${id}`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  },
};
