export type MovieComment = {
  id: number;
  movieId: number;
  authorId: number;
  authorName: string;
  body: string;
  createdAt: string;
  mine: boolean;
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
