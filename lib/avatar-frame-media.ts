/** Stable frame IDs are persisted in user profiles. Replace media, never IDs. */
export type FrameMedia = {
  src: string;
  poster: string;
  version: number;
  animated: boolean;
  scale: number;
};
/** One declaration per replacement; paths follow the public asset convention. */
export function frameMedia(
  collection: "realms" | "elements" | "beasts" | "achievements" | "special",
  frameId: string,
  version: number,
  scale = 1.35,
): FrameMedia {
  const base = `/assets/avatar-frames/${collection}/${frameId}/v${version}`;
  return {
    src: `${base}/animated.webp`,
    poster: `${base}/poster.webp`,
    version,
    animated: true,
    scale,
  };
}
export const avatarFrameMedia: Record<string, FrameMedia | undefined> = {
  // Phàm Nhân: add "realm-0": frameMedia("realms", "realm-0", 1, 1.35),
  "realm-0": frameMedia("realms", "realm-0", 1, 1.35),
  "realm-14": frameMedia("realms", "realm-14", 1, 1.55),
};
