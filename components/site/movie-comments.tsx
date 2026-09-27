"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import type { Account } from "@/lib/app-types";
import type { MovieComment } from "@/lib/comments";
import { viewerGateway } from "@/lib/viewer-gateway";
import type { Navigate } from "@/components/site/types";

type Props = { movieId: number; user: Account | null; go: Navigate };

export default function MovieComments({ movieId, user, go }: Props) {
  const [comments, setComments] = useState<MovieComment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void viewerGateway
      .comments(movieId)
      .then(
        (items) => {
          if (active) setComments(items);
        },
        () => {
          if (active) setError("Chưa thể tải bình luận. Vui lòng thử lại sau.");
        },
      )
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [movieId]);

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
      );
      setComments((current) => [comment, ...current].slice(0, 50));
      setBody("");
    } catch {
      setError("Chưa thể gửi bình luận. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Xóa bình luận này?")) return;
    try {
      await viewerGateway.removeComment(movieId, id);
      setComments((current) => current.filter((item) => item.id !== id));
    } catch {
      setError("Chưa thể xóa bình luận. Vui lòng thử lại sau.");
    }
  };

  return (
    <section className="movie-comments" aria-label="Bình luận phim">
      <div className="movie-comments-heading">
        <MessageCircle size={21} />
        <h2>Bình luận phim</h2>
        <span>{comments.length}</span>
      </div>

      {user?.role === "user" ? (
        <form onSubmit={submit} className="movie-comment-form">
          <label htmlFor={`comment-${movieId}`}>Chia sẻ cảm nhận của bạn</label>
          <textarea
            id={`comment-${movieId}`}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Bạn nghĩ gì về bộ phim này?"
          />
          <div>
            <span>{body.length}/1000 ký tự</span>
            <button
              type="submit"
              disabled={submitting || body.trim().length < 2}
            >
              {submitting ? "Đang gửi…" : "Gửi bình luận"}
            </button>
          </div>
        </form>
      ) : !user ? (
        <div className="movie-comments-login">
          <span>Đăng nhập hoặc tạo tài khoản để tham gia thảo luận.</span>
          <button type="button" onClick={() => go("/dang-nhap")}>
            Đăng nhập / Đăng ký
          </button>
        </div>
      ) : null}

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
            <article key={comment.id} className="movie-comment">
              <div className="movie-comment-avatar" aria-hidden="true">
                {comment.authorName.charAt(0).toUpperCase()}
              </div>
              <div className="movie-comment-content">
                <header>
                  <strong>{comment.authorName}</strong>
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
                <p>{comment.body}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="movie-comments-empty">
          Chưa có bình luận. Hãy là người đầu tiên chia sẻ cảm nhận.
        </p>
      )}
    </section>
  );
}
