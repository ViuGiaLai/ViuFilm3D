import { avatarFrames } from "@/lib/avatar-frames";
import { validAvatarIds } from "@/lib/social-types";
export type SupportProfile = {
  name: string;
  bio: string;
  avatarId: string;
  avatarFrameId: string;
  cultivationXp: number;
  frameGrants: string[];
};
export function parseSupportProfile(value: unknown): SupportProfile {
  if (!value || typeof value !== "object")
    throw new Error("Hồ sơ không hợp lệ.");
  const v = value as SupportProfile;
  if (
    typeof v.name !== "string" ||
    v.name.trim().length < 2 ||
    v.name.trim().length > 100 ||
    typeof v.bio !== "string" ||
    v.bio.length > 300 ||
    !validAvatarIds.includes(v.avatarId) ||
    !avatarFrames.some((f) => f.id === v.avatarFrameId) ||
    !Number.isSafeInteger(v.cultivationXp) ||
    v.cultivationXp < 0 ||
    v.cultivationXp > 1000000 ||
    !Array.isArray(v.frameGrants) ||
    v.frameGrants.length > avatarFrames.length ||
    v.frameGrants.some(
      (id) => typeof id !== "string" || !avatarFrames.some((f) => f.id === id),
    )
  )
    throw new Error("Tên, avatar, viền hoặc đạo hạnh không hợp lệ.");
  return {
    name: v.name.trim(),
    bio: v.bio.trim(),
    avatarId: v.avatarId,
    avatarFrameId: v.avatarFrameId,
    cultivationXp: v.cultivationXp,
    frameGrants: [...new Set(v.frameGrants)].sort(),
  };
}
export function supportProfile(v: {
  name: string;
  bio?: string;
  avatarId?: string;
  avatarFrameId?: string;
  cultivationXp?: number;
  frameGrants?: string[];
}): SupportProfile {
  return {
    name: v.name,
    bio: v.bio ?? "",
    avatarId: v.avatarId ?? "moon",
    avatarFrameId: v.avatarFrameId ?? "none",
    cultivationXp: v.cultivationXp ?? 0,
    frameGrants: v.frameGrants ?? [],
  };
}
export type WorldModeration = {
  id: number;
  senderId: number;
  body: string;
  status: "visible" | "hidden";
  createdAt: string;
  authorName: string;
  avatarId: string;
  avatarVersion: string | null;
  avatarFrameId: string;
  cultivationXp: number;
};
