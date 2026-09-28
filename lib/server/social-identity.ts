import "server-only";

import { getAdminSession } from "@/lib/server/admin-session";
import { getViewerIdentity } from "@/lib/server/viewer-session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Account } from "@/lib/app-types";

export type SocialIdentity = {
  id: number;
  account: Account;
};

export async function getSocialIdentity(): Promise<SocialIdentity | null> {
  const admin = await getAdminSession();
  if (!admin) return getViewerIdentity();

  return getAdminProfile(admin.email);
}

export async function getAdminProfile(
  email: string,
): Promise<SocialIdentity | null> {
  const db = createSupabaseAdminClient();
  const findProfile = () =>
    db.from("app_users").select("*").eq("email", email).maybeSingle();
  let { data: profile, error } = await findProfile();
  if (error) throw error;

  if (!profile) {
    const now = new Date().toISOString();
    const inserted = await db.from("app_users").insert({
      name: "Quản trị viên",
      email,
      role: "admin",
      status: "Đang hoạt động",
      plan: "Miễn phí",
      joined_at: now.slice(0, 10),
      last_active: now,
      watches: 0,
      cultivation_xp: 11900,
    });
    if (inserted.error && inserted.error.code !== "23505") {
      throw inserted.error;
    }
    ({ data: profile, error } = await findProfile());
    if (error) throw error;
  }

  if (
    !profile ||
    profile.role !== "admin" ||
    profile.status !== "Đang hoạt động"
  ) {
    return null;
  }
  return {
    id: Number(profile.id),
    account: {
      id: Number(profile.id),
      publicId: profile.public_id,
      cultivationXp: Number(profile.cultivation_xp ?? 0),
      avatarFrameId: profile.avatar_frame_id,
      frameGrants: profile.avatar_frame_grants ?? [],
      email: profile.email,
      name: profile.name,
      role: "admin",
      avatarId: profile.avatar_id,
      avatarVersion: profile.avatar_updated_at,
      bio: profile.bio,
    },
  };
}
