import { requestApi } from "@/lib/api-client";
import { apiMode } from "@/lib/config";
import type { Account } from "@/lib/app-types";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export const authGateway = {
  async loginWithGoogle(): Promise<{ url?: string; error?: string } | null> {
    if (apiMode === "mock") return null;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return { error: "Không tìm thấy cấu hình kết nối Supabase." };
    }

    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : "";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data?.url) {
      window.location.href = data.url;
    }

    return null;
  },

  async register(name: string, email: string, password: string) {
    return requestApi<{ confirmationRequired: boolean; userAlreadyExists?: boolean }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  async resendConfirmation(email: string) {
    return requestApi<{ sent: boolean }>("/auth/resend-confirmation", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async login(email: string, password: string): Promise<Account | null> {
    if (apiMode === "mock") return null;
    return requestApi<Account | null>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async session(): Promise<Account | null> {
    if (apiMode === "mock") return null;
    return requestApi<Account | null>("/auth/session", {
      cache: "no-store",
    });
  },

  async logout() {
    if (apiMode !== "production") return;
    await requestApi<null>("/auth/logout", { method: "POST" }).catch(
      () => undefined,
    );
  },

  async updateProfile(
    name: string,
    avatarId: string,
    bio: string,
    avatarFrameId?: string,
  ): Promise<Account> {
    return requestApi<Account>("/me/profile", {
      method: "PATCH",
      body: JSON.stringify({ name, avatarId, bio, avatarFrameId }),
    });
  },

  async uploadAvatar(file: File): Promise<Account> {
    const form = new FormData();
    form.set("file", file);
    return requestApi<Account>("/me/avatar", {
      method: "POST",
      body: form,
    });
  },
};
