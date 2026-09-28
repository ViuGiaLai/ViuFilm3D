import "server-only";

import { cookies } from "next/headers";
import type { Session } from "@supabase/supabase-js";
import {
  createSupabaseAdminClient,
  createSupabaseReadClient,
} from "@/lib/supabase/server";
import type { Account } from "@/lib/app-types";
import { ConfigurationError } from "@/lib/server/errors";

const ACCESS_COOKIE = "viufilm3d_viewer_access";
const REFRESH_COOKIE = "viufilm3d_viewer_refresh";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export type ViewerIdentity = {
  id: number;
  authUserId: string;
  account: Account;
};

export async function findViewerProfile(
  authUserId: string,
): Promise<ViewerIdentity | null> {
  const { data, error } = await createSupabaseAdminClient()
    .from("app_users")
    // Server-only row, returned through the explicit whitelist below.
    // Existing sessions continue working before the additive migration.
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    throw new ConfigurationError("Không thể kiểm tra tài khoản người xem.");
  }
  if (!data || data.role !== "user" || data.status !== "Đang hoạt động") {
    return null;
  }

  return {
    id: Number(data.id),
    authUserId,
    account: {
      id: Number(data.id),
      publicId: data.public_id,
      cultivationXp: Number(data.cultivation_xp ?? 0),
      avatarFrameId: data.avatar_frame_id,
      frameGrants: data.avatar_frame_grants ?? [],
      email: data.email,
      name: data.name,
      role: "user",
      avatarId: data.avatar_id,
      avatarVersion: data.avatar_updated_at,
      bio: data.bio,
    },
  };
}

export async function setViewerSession(session: Session) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, session.access_token, {
    ...cookieOptions,
    maxAge: Math.max(60, session.expires_in),
  });
  store.set(REFRESH_COOKIE, session.refresh_token, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function clearViewerSession() {
  const store = await cookies();
  store.set(ACCESS_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  store.set(REFRESH_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}

export async function getViewerIdentity(): Promise<ViewerIdentity | null> {
  const store = await cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  if (!accessToken && !refreshToken) return null;

  const auth = createSupabaseReadClient().auth;
  let user = accessToken ? (await auth.getUser(accessToken)).data.user : null;

  if (!user && refreshToken) {
    const refreshed = await auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (!refreshed.data.session) return null;
    user = refreshed.data.user;
    await setViewerSession(refreshed.data.session);
  }
  if (!user) return null;

  return findViewerProfile(user.id);
}
