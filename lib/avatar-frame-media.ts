/** Stable frame IDs are persisted in user profiles. Replace media, never IDs. */
export type FrameMedia = {
  src: string;
  poster: string;
  version: number;
  animated: boolean;
  scale: number;
};
export const avatarFrameMedia: Record<string, FrameMedia | undefined> = {
  "realm-14": {
    src: "/assets/avatar-frames/realms/realm-14/v1/animated.webp",
    poster: "/assets/avatar-frames/realms/realm-14/v1/poster.webp",
    version: 1,
    animated: true,
    scale: 1.55,
  },
};
