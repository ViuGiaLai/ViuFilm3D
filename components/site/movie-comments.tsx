"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import { userCardPosition } from "@/lib/user-card-position";
import { Heart, MessageSquare, Reply, Send, Trash2 } from "lucide-react";
import type { Account } from "@/lib/app-types";
import type { MovieComment } from "@/lib/comments";
import { viewerGateway } from "@/lib/viewer-gateway";
import { ApiRequestError } from "@/lib/api-client";
import { apiMode } from "@/lib/config";
import { subscribeToInvalidation } from "@/lib/realtime-client";
import { UserAvatar } from "@/components/ui/user-avatar";
import { CultivationBadge } from "@/components/ui/cultivation-badge";
import { getCultivation } from "@/lib/cultivation";
import type { Navigate } from "@/components/site/types";

type Props = { movieId: number; currentEpisodeIndex?: number; user: Account | null; go: Navigate };

export default function MovieComments({ movieId, currentEpisodeIndex, user, go }: Props) {
  const [comments, setComments] = useState<MovieComment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [likingId, setLikingId] = useState<number | null>(null);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [openAuthorId, setOpenAuthorId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const loadedMovieId = useRef<number | null>(null);
  const currentMovieId = useRef(movieId);
  const authorTrigger = useRef<HTMLButtonElement | null>(null);
  const authorCard = useRef<HTMLDivElement | null>(null);
  const [cardPosition, setCardPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const closeAuthorCard = () => {
    setOpenAuthorId(null);
    if (authorTrigger.current?.isConnected)
      authorTrigger.current.focus({ preventScroll: true });
  };
  const toggleAuthorCard = (id: number, trigger: HTMLButtonElement) => {
    authorTrigger.current = trigger;
    setCardPosition(null);
    setOpenAuthorId((current) => (current === id ? null : id));
  };
  useLayoutEffect(() => {
    if (openAuthorId === null) return;
    let frame = 0;
    const place = () => {
      const card = authorCard.current;
      const trigger = authorTrigger.current;
      if (!card || !trigger?.isConnected) return;
      const viewport = window.visualViewport;
      const bounds = trigger.getBoundingClientRect();
      const height = viewport?.height ?? window.innerHeight;
      const top = viewport?.offsetTop ?? 0;
      if (bounds.bottom < top || bounds.top > top + height) {
        setOpenAuthorId(null);
        return;
      }
      setCardPosition(
        userCardPosition(bounds, card.getBoundingClientRect(), {
          width: viewport?.width ?? window.innerWidth,
          height,
          top,
        }),
      );
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    place();
    const observer = new ResizeObserver(schedule);
    if (authorCard.current) observer.observe(authorCard.current);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
    };
  }, [openAuthorId]);
  useEffect(() => {
    currentMovieId.current = movieId;
    setOpenAuthorId(null);
    setReplyTo(null);
    setBody("");
  }, [movieId]);

  useEffect(() => {
    if (openAuthorId === null) return;
    document
      .getElementById(`comment-user-close-${movieId}-${openAuthorId}`)
      ?.focus({ preventScroll: true });
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenAuthorId(null);
        if (authorTrigger.current?.isConnected)
          authorTrigger.current.focus({ preventScroll: true });
      }
    };
    const closeOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        !event.target.closest(
          ".comment-user-card, .movie-comment-author-name, .movie-comment-author-avatar",
        )
      )
        setOpenAuthorId(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [openAuthorId, movieId]);

  useEffect(() => {
    let active = true;
    setLoading(loadedMovieId.current !== movieId);
    setLoadFailed(false);
    setError("");
    void viewerGateway
      .comments(movieId)
      .then(
        (page) => {
          if (active) {
            loadedMovieId.current = movieId;
            setComments(page.items);
            setHasMore(page.hasMore);
            setLoadedCount(page.items.length);
          }
        },
        () => {
          if (active) {
            setLoadFailed(true);
            setError("Chưa thể tải bình luận. Vui lòng thử lại sau.");
          }
        },
      )
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [movieId, reloadKey, user?.id]);

  useEffect(() => {
    if (apiMode !== "production") return;
    let timer: number | null = null;
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      setReloadKey((value) => value + 1);
    };
    const schedule = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(refresh, 350);
    };
    const unsubscribe = subscribeToInvalidation(
      `movie-comments:${movieId}`,
      schedule,
    );
    document.addEventListener("visibilitychange", refresh);
    const fallback = window.setInterval(refresh, 45_000);
    return () => {
      unsubscribe();
      if (timer !== null) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.clearInterval(fallback);
    };
  }, [movieId]);

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await viewerGateway.comments(movieId, loadedCount);
      if (currentMovieId.current !== movieId) return;
      setComments((current) => [
        ...current,
        ...page.items.filter(
          (item) => !current.some((existing) => existing.id === item.id),
        ),
      ]);
      setHasMore(page.hasMore);
      setLoadedCount((count) => count + page.items.length);
    } catch {
      setError("Chưa thể tải thêm bình luận. Vui lòng thử lại.");
    } finally {
      setLoadingMore(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || submitting) return;
    const content = body.trim();
    if (content.length < 2 || content.length > 1000) {
      setError("Bình luận cần từ 2 đến 1000 ký tự.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const comment = await viewerGateway.addComment(
        movieId,
        content,
        user.name,
        user.avatarId,
        user.avatarVersion,
        replyTo,
        currentEpisodeIndex,
      );
      if (currentMovieId.current !== movieId) return;
      setComments((current) =>
        [comment, ...current.filter((item) => item.id !== comment.id)].slice(
          0,
          50,
        ),
      );
      setReloadKey((value) => value + 1);
      setBody("");
      setReplyTo(null);
    } catch (submitError) {
      setError(
        submitError instanceof ApiRequestError &&
          [400, 401, 409, 429].includes(submitError.status)
          ? submitError.message
          : "Chưa thể gửi bình luận. Vui lòng thử lại sau.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Xóa bình luận này?")) return;
    try {
      await viewerGateway.removeComment(movieId, id);
      setComments((current) => current.filter((item) => item.id !== id));
      setReloadKey((value) => value + 1);
    } catch {
      setError("Chưa thể xóa bình luận. Vui lòng thử lại sau.");
    }
  };

  const toggleLike = async (comment: MovieComment) => {
    if (!user) {
      go("/dang-nhap");
      return;
    }
    if (likingId) return;
    setLikingId(comment.id);
    setError("");
    try {
      const result = await viewerGateway.setCommentLike(
        movieId,
        comment.id,
        !comment.liked,
      );
      setComments((current) =>
        current.map((item) =>
          item.id === comment.id
            ? { ...item, liked: result.liked, likeCount: result.likeCount }
            : item,
        ),
      );
    } catch {
      setError("Chưa thể cập nhật lượt thích.");
    } finally {
      setLikingId(null);
    }
  };

  return (
    <section className="movie-comments" aria-label="Bình luận phim">
      <div className="movie-comments-heading">
        <span className="movie-comments-heading-icon">
          <MessageSquare size={21} />
        </span>
        <h2>Bình luận</h2>
        <span className="movie-comments-count">{comments.length}</span>
      </div>

      {user ? (
        <form onSubmit={submit} className="movie-comment-form">
          <UserAvatar
            frameId={user.avatarFrameId}
            cultivationXp={user.cultivationXp}
            avatarId={user.avatarId}
            avatarVersion={user.avatarVersion}
            userId={user.id}
            name={user.name}
          />
          <div className="movie-comment-compose">
            <label
              htmlFor={`comment-${movieId}`}
              className={replyTo ? "movie-comment-reply-label" : "sr-only"}
            >
              {replyTo
                ? `Phản hồi ${comments.find((item) => item.id === replyTo)?.authorName ?? "bình luận"}`
                : "Chia sẻ cảm nhận của bạn"}
            </label>
            {replyTo && (
              <button
                type="button"
                className="movie-comment-cancel-reply"
                onClick={() => setReplyTo(null)}
              >
                Hủy phản hồi
              </button>
            )}
            <textarea
              id={`comment-${movieId}`}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Đạo hữu nghĩ gì về bộ phim này?"
            />
            <div className="movie-comment-form-footer">
              <span>{body.length}/1000</span>
              <button
                type="submit"
                disabled={submitting || body.trim().length < 2}
              >
                {submitting
                  ? "Đang gửi…"
                  : replyTo
                    ? "Gửi phản hồi"
                    : "Bình luận"}
                <Send size={15} />
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="movie-comments-login">
          <span>Đăng nhập hoặc tạo tài khoản để tham gia thảo luận.</span>
          <button type="button" onClick={() => go("/dang-nhap")}>
            Đăng nhập / Đăng ký
          </button>
        </div>
      )}

      {error && (
        <p className="movie-comments-error" role="status">
          {error}
        </p>
      )}
      {loading ? (
        <p className="movie-comments-empty">Đang tải bình luận…</p>
      ) : comments.length ? (
        <div className="movie-comments-list">
          {comments.map((comment) => (
            <article
              key={comment.id}
              className={`movie-comment ${comment.parentId ? "movie-comment--reply" : ""}`}
            >
              <button
                type="button"
                className="movie-comment-author-avatar"
                onClick={(event) =>
                  toggleAuthorCard(comment.id, event.currentTarget)
                }
                disabled={apiMode !== "production"}
                aria-label={`Mở thẻ người dùng ${comment.authorName}`}
                aria-expanded={openAuthorId === comment.id}
                aria-controls={
                  openAuthorId === comment.id
                    ? `comment-user-card-${movieId}-${comment.id}`
                    : undefined
                }
              >
                <UserAvatar
                  frameId={comment.authorFrameId}
                  cultivationXp={comment.authorCultivationXp}
                  avatarId={comment.avatarId}
                  avatarVersion={comment.avatarVersion}
                  userId={comment.authorId}
                  name={comment.authorName}
                  size="small"
                />
              </button>
              <div className="movie-comment-content">
                <header>
                  <button
                    type="button"
                    className="movie-comment-author-name"
                    onClick={(event) =>
                      toggleAuthorCard(comment.id, event.currentTarget)
                    }
                    disabled={apiMode !== "production"}
                    aria-expanded={openAuthorId === comment.id}
                    aria-controls={
                      openAuthorId === comment.id
                        ? `comment-user-card-${movieId}-${comment.id}`
                        : undefined
                    }
                  >
                    {comment.authorName}
                  </button>
                  <CultivationBadge xp={comment.authorCultivationXp} />
                  {comment.episodeIndex != null && (
                    <span className="movie-comment-episode">
                      Tập {comment.episodeIndex}
                    </span>
                  )}
                  <time dateTime={comment.createdAt}>
                    {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                  </time>
                  {comment.mine && (
                    <button
                      type="button"
                      onClick={() => void remove(comment.id)}
                      aria-label="Xóa bình luận"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </header>
                {openAuthorId === comment.id &&
                  createPortal(
                    <div
                      ref={authorCard}
                      className="comment-user-card"
                      style={{
                        left: cardPosition?.left ?? 12,
                        top: cardPosition?.top ?? 12,
                        visibility: cardPosition ? "visible" : "hidden",
                      }}
                      id={`comment-user-card-${movieId}-${comment.id}`}
                      role="dialog"
                      aria-modal="false"
                      aria-label={`Thẻ người dùng ${comment.authorName}`}
                    >
                      <div className="comment-user-card-cover" />
                      <button
                        type="button"
                        className="comment-user-card-close"
                        id={`comment-user-close-${movieId}-${comment.id}`}
                        onClick={closeAuthorCard}
                        aria-label="Đóng thẻ người dùng"
                      >
                        ×
                      </button>
                      <div className="comment-user-card-body">
                        <UserAvatar
                          avatarId={comment.avatarId}
                          avatarVersion={comment.avatarVersion}
                          userId={comment.authorId}
                          name={comment.authorName}
                          frameId={comment.authorFrameId}
                          cultivationXp={comment.authorCultivationXp}
                          size="large"
                        />
                        <strong>{comment.authorName}</strong>
                        <CultivationBadge xp={comment.authorCultivationXp} />
                        <p>
                          {
                            getCultivation(comment.authorCultivationXp ?? 0)
                              .description
                          }
                        </p>
                        <small>
                          {comment.authorCultivationXp ?? 0} đạo hạnh
                        </small>
                        {comment.authorPublicId && (
                          <button
                            type="button"
                            className="comment-user-card-link"
                            onClick={() =>
                              go(`/nguoi-dung/${comment.authorPublicId}`)
                            }
                          >
                            Ghé động phủ →
                          </button>
                        )}
                      </div>
                    </div>,
                    document.body,
                  )}
                {comment.parentId && (
                  <span className="movie-comment-reply-context">
                    ↳ Phản hồi{" "}
                    {comments.find((item) => item.id === comment.parentId)
                      ?.authorName ?? "bình luận"}
                  </span>
                )}
                <p>{comment.body}</p>
                <div className="movie-comment-actions">
                  <button
                    type="button"
                    className={comment.liked ? "liked" : ""}
                    onClick={() => void toggleLike(comment)}
                    disabled={likingId === comment.id}
                    aria-label={`${comment.liked ? "Bỏ thích" : "Thích"} bình luận`}
                  >
                    <Heart
                      size={16}
                      fill={comment.liked ? "currentColor" : "none"}
                    />
                    {comment.likeCount ?? 0}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        go("/dang-nhap");
                        return;
                      }
                      setReplyTo(comment.id);
                      document.getElementById(`comment-${movieId}`)?.focus();
                    }}
                  >
                    <Reply size={16} /> Phản hồi
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : loadFailed ? (
        <button
          type="button"
          className="movie-comments-more"
          onClick={() => setReloadKey((value) => value + 1)}
        >
          Thử tải lại bình luận
        </button>
      ) : (
        <p className="movie-comments-empty">
          Chưa có bình luận. Hãy là người đầu tiên chia sẻ cảm nhận.
        </p>
      )}
      {hasMore && (
        <button
          type="button"
          className="movie-comments-more"
          onClick={() => void loadMore()}
          disabled={loadingMore}
        >
          {loadingMore ? "Đang tải…" : "Xem thêm bình luận"}
        </button>
      )}
    </section>
  );
}
