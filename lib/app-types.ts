export type Account = {
  id?: number;
  publicId?: string;
  cultivationXp?: number;
  avatarFrameId?: string;
  frameGrants?: string[];
  email: string;
  name: string;
  role: "admin" | "user";
  avatarId?: string;
  avatarVersion?: string | null;
  bio?: string;
};

export type HistoryItem = {
  movieId: number;
  episode: number;
  watchedAt: string;
  progress: number;
  positionSeconds?: number;
  durationSeconds?: number;
};

export type ThemeMode = "dark" | "light";
