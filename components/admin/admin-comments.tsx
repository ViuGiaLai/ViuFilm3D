"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, MessageCircle, Trash2 } from "lucide-react";
import { adminGateway } from "@/lib/admin-gateway";
import type { ModerationComment } from "@/lib/comments";
import { apiMode } from "@/lib/config";

export default function AdminComments() {
  const [comments, setComments] = useState<ModerationComment[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void adminGateway
      .listComments()
      .then(
        (items) => {
          if (active) setComments(items);
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
  }, []);

  const changeStatus = async (comment: ModerationComment) => {
    const next = comment.status === "visible" ? "hidden" : "visible";
    try {
      await adminGateway.setCommentStatus(comment.id, next);
      setComments((items) =>
        items.map((item) =>
          item.id === comment.id ? { ...item, status: next } : item,
        ),
      );
    } catch {
      setMessage("Chưa thể cập nhật bình luận.");
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Xóa vĩnh viễn bình luận này?")) return;
    try {
      await adminGateway.removeComment(id);
      setComments((items) => items.filter((item) => item.id !== id));
    } catch {
      setMessage("Chưa thể xóa bình luận.");
    }
  };

  return (
    <section className="admin-comments admin-users">
      <div className="admin-toolbar">
        <span>
          <MessageCircle size={18} /> {comments.length} bình luận gần đây
        </span>
      </div>
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
                      onClick={() => void changeStatus(comment)}
                      title={comment.status === "visible" ? "Ẩn" : "Hiện"}
                    >
                      {comment.status === "visible" ? <EyeOff /> : <Eye />}
                    </button>
                    <button
                      type="button"
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
    </section>
  );
}
