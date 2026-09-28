"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, MessageCircle, Trash2, RefreshCw } from "lucide-react";
import { adminGateway } from "@/lib/admin-gateway";
import type { ModerationComment } from "@/lib/comments";
import { apiMode } from "@/lib/config";

export default function AdminComments() {
  const [comments, setComments] = useState<ModerationComment[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [revision, setRevision] = useState(0);
  const [pending, setPending] = useState<number[]>([]);
  const busy = useRef(new Set<number>());

  useEffect(() => {
    let active = true;
    setLoading(true);
    setMessage("");
    void adminGateway
      .listComments(page * 50, status, search)
      .then(
        (items) => {
          if (active) {
            setComments(items.items);
            setHasMore(items.hasMore);
          }
        },
        () => {
          if (active) setMessage("Chưa thể tải bình luận.");
        },
      )
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, status, search, revision]);

  const changeStatus = async (comment: ModerationComment) => {
    if (busy.current.has(comment.id)) return;
    busy.current.add(comment.id);
    setPending([...busy.current]);
    const next = comment.status === "visible" ? "hidden" : "visible";
    try {
      await adminGateway.setCommentStatus(comment.id, next);
      setRevision((value) => value + 1);
    } catch {
      setMessage("Chưa thể cập nhật bình luận.");
    } finally {
      busy.current.delete(comment.id);
      setPending([...busy.current]);
    }
  };

  const remove = async (id: number) => {
    if (busy.current.has(id)) return;
    if (!window.confirm("Xóa vĩnh viễn bình luận này?")) return;
    busy.current.add(id);
    setPending([...busy.current]);
    try {
      await adminGateway.removeComment(id);
      setRevision((value) => value + 1);
    } catch {
      setMessage("Chưa thể xóa bình luận.");
    } finally {
      busy.current.delete(id);
      setPending([...busy.current]);
    }
  };

  return (
    <section className="admin-comments admin-users">
      <div className="admin-toolbar">
        <span>
          <MessageCircle size={18} /> Kiểm duyệt bình luận
        </span>
      </div>
      <form
        className="admin-toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(0);
          setSearch(keyword.trim());
          setRevision((value) => value + 1);
        }}
      >
        <input
          aria-label="Tìm nội dung bình luận"
          placeholder="Tìm nội dung bình luận…"
          maxLength={100}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <select
          aria-label="Trạng thái bình luận"
          value={status}
          onChange={(event) => {
            setPage(0);
            setStatus(event.target.value);
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="visible">Đang hiển thị</option>
          <option value="hidden">Đã ẩn</option>
        </select>
        <button type="submit" disabled={loading}>
          Tìm kiếm
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => setRevision((value) => value + 1)}
        >
          <RefreshCw size={16} /> Làm mới
        </button>
      </form>
      <p className="form-hint">
        Ưu tiên ẩn để có thể khôi phục. Xóa là vĩnh viễn; thay đổi kiểm duyệt
        được cập nhật cho người xem qua realtime.
      </p>
      {apiMode === "mock" && (
        <p>
          Bình luận mẫu được lưu trên từng trình duyệt. Chuyển sang production
          để quản lý bình luận thật.
        </p>
      )}
      {message && (
        <p className="form-error" role="status">
          {message}
        </p>
      )}
      {loading ? (
        <p>Đang tải bình luận…</p>
      ) : (
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Người viết</th>
                <th>Phim</th>
                <th>Nội dung</th>
                <th>Ngày</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id}>
                  <td>
                    <b>{comment.authorName}</b>
                    <small>{comment.authorEmail}</small>
                  </td>
                  <td>{comment.movieTitle}</td>
                  <td className="admin-comment-body">{comment.body}</td>
                  <td>
                    {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td>{comment.status === "visible" ? "Hiển thị" : "Đã ẩn"}</td>
                  <td>
                    <button
                      type="button"
                      disabled={pending.includes(comment.id)}
                      onClick={() => void changeStatus(comment)}
                      title={comment.status === "visible" ? "Ẩn" : "Hiện"}
                    >
                      {comment.status === "visible" ? <EyeOff /> : <Eye />}
                    </button>
                    <button
                      type="button"
                      disabled={pending.includes(comment.id)}
                      onClick={() => void remove(comment.id)}
                      title="Xóa vĩnh viễn"
                    >
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!comments.length && (
            <p className="admin-empty">Chưa có bình luận.</p>
          )}
        </div>
      )}
      <div className="admin-pagination">
        <span>Trang {page + 1} · tối đa 50 bình luận/trang</span>
        <div>
          <button
            disabled={loading || page === 0}
            onClick={() => setPage((value) => value - 1)}
          >
            Trước
          </button>
          <button
            disabled={loading || !hasMore}
            onClick={() => setPage((value) => value + 1)}
          >
            Sau
          </button>
        </div>
      </div>
    </section>
  );
}
