export type MovieComment = {
  id: number;
  movieId: number;
  authorId: number;
  authorPublicId?: string;
  authorCultivationXp?: number;
  authorFrameId?: string;
  authorName: string;
  avatarId?: string;
  avatarVersion?: string | null;
  body: string;
  createdAt: string;
  mine: boolean;
  parentId?: number | null;
  likeCount?: number;
  liked?: boolean;
};

export type CommentPage = {
  items: MovieComment[];
  hasMore: boolean;
};

export type ModerationComment = MovieComment & {
  movieTitle: string;
  authorEmail: string;
  status: "visible" | "hidden";
};
