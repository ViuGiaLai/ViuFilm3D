"use client";

import { useRef, useState } from "react";
import {
  Pencil,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import type { Viewer } from "@/lib/admin-data";
import type { EditViewer, PatchViewer } from "@/components/admin/types";
import { getCultivation } from "@/lib/cultivation";
import { UserAvatar } from "@/components/ui/user-avatar";

type AdminUsersProps = {
  viewers: Viewer[];
  edit: EditViewer;
  patch: PatchViewer;
  remove: (id: number) => Promise<void>;
};

export default function AdminUsers({
  viewers,
  edit,
  patch,
  remove,
}: AdminUsersProps) {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("Tất cả");
  const [page, setPage] = useState(1);
  const busy = useRef(new Set<number>());
  const [pending, setPending] = useState<number[]>([]);
  const act = async (id: number, action: () => Promise<void>) => {
    if (busy.current.has(id)) return;
    busy.current.add(id);
    setPending([...busy.current]);
    try {
      await action();
    } finally {
      busy.current.delete(id);
      setPending([...busy.current]);
    }
  };
  const filtered = viewers.filter((viewer: Viewer) => {
    const matched = `${viewer.name} ${viewer.email}`
      .toLowerCase()
      .includes(keyword.toLowerCase());
    return (
      matched &&
      (status === "Tất cả" ||
        viewer.status === status ||
        viewer.plan === status)
    );
  });
  const pages = Math.max(1, Math.ceil(filtered.length / 20));
  const currentPage = Math.min(page, pages);
  const list = filtered.slice((currentPage - 1) * 20, currentPage * 20);
  return (
    <section className="admin-users">
      <div className="admin-summary-strip">
        <article>
          <Users />
          <span>
            Tổng tài khoản<strong>{viewers.length}</strong>
          </span>
        </article>
        <article>
          <UserCheck />
          <span>
            Đang hoạt động
            <strong>
              {
                viewers.filter(
                  (viewer: Viewer) => viewer.status === "Đang hoạt động",
                ).length
              }
            </strong>
          </span>
        </article>
        <article>
          <Star />
          <span>
            Thành viên VIP
            <strong>
              {viewers.filter((viewer: Viewer) => viewer.plan === "VIP").length}
            </strong>
          </span>
        </article>
      </div>
      <div className="admin-toolbar user-toolbar">
        <div className="catalog-search">
          <Search />
          <input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(1);
            }}
            placeholder="Tìm tên hoặc email..."
          />
        </div>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option>Tất cả</option>
          <option>Đang hoạt động</option>
          <option>Đã khóa</option>
          <option>VIP</option>
          <option>Miễn phí</option>
        </select>
      </div>
      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Vai trò</th>
              <th>Gói</th>
              <th>Trạng thái</th>
              <th>Ngày tham gia</th>
              <th>Hoạt động</th>
              <th>Cảnh giới</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((viewer: Viewer) => (
              <tr key={viewer.id}>
                <td>
                  <UserAvatar
                    name={viewer.name}
                    userId={viewer.id}
                    avatarId={viewer.avatarId}
                    avatarVersion={viewer.avatarVersion}
                    frameId={viewer.avatarFrameId}
                    cultivationXp={viewer.cultivationXp}
                  />
                  <span>
                    <b>{viewer.name}</b>
                    <small>{viewer.email}</small>
                    {viewer.role === "user" && (
                      <small>
                        {viewer.hasLogin
                          ? "Đã liên kết đăng nhập"
                          : "Hồ sơ mẫu, chưa có đăng nhập"}
                      </small>
                    )}
                  </span>
                </td>
                <td>
                  <span className="role-badge">
                    <ShieldCheck />
                    {viewer.role === "admin" ? "Quản trị" : "Người xem"}
                  </span>
                </td>
                <td>
                  <button
                    className={`plan-badge ${viewer.plan === "VIP" ? "vip" : ""}`}
                    disabled={pending.includes(viewer.id)}
                    onClick={() =>
                      void act(viewer.id, () =>
                        patch(viewer.id, {
                          plan: viewer.plan === "VIP" ? "Miễn phí" : "VIP",
                        }),
                      )
                    }
                  >
                    {viewer.plan}
                  </button>
                </td>
                <td>
                  <button
                    className={`account-status ${viewer.status === "Đã khóa" ? "blocked" : ""}`}
                    disabled={
                      viewer.role === "admin" || pending.includes(viewer.id)
                    }
                    onClick={() =>
                      void act(viewer.id, () =>
                        patch(viewer.id, {
                          status:
                            viewer.status === "Đang hoạt động"
                              ? "Đã khóa"
                              : "Đang hoạt động",
                        }),
                      )
                    }
                  >
                    <i />
                    {viewer.status}
                  </button>
                </td>
                <td>{new Date(viewer.joinedAt).toLocaleDateString("vi-VN")}</td>
                <td>
                  <b>{viewer.watches} lượt xem</b>
                  <small>
                    {new Date(viewer.lastActive).toLocaleDateString("vi-VN")}
                  </small>
                </td>
                <td>
                  <b>{getCultivation(viewer.cultivationXp ?? 0).title}</b>
                  <small>{viewer.cultivationXp ?? 0} đạo hạnh</small>
                  {viewer.publicId && (
                    <a
                      href={`/nguoi-dung/${viewer.publicId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Hồ sơ công khai
                    </a>
                  )}
                </td>
                <td>
                  <button
                    title="Chỉnh sửa tài khoản"
                    disabled={pending.includes(viewer.id)}
                    onClick={() => edit(viewer)}
                  >
                    <Pencil />
                  </button>
                  <button
                    className="delete-icon"
                    disabled={
                      viewer.role === "admin" || pending.includes(viewer.id)
                    }
                    title={
                      viewer.role === "admin"
                        ? "Không thể xóa tài khoản quản trị viên"
                        : "Xóa tài khoản này"
                    }
                    onClick={() => void act(viewer.id, () => remove(viewer.id))}
                  >
                    <Trash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && (
          <div className="admin-empty">
            <Users />
            <b>Không có tài khoản phù hợp</b>
            <span>Thử thay đổi bộ lọc tìm kiếm.</span>
          </div>
        )}
      </div>
      <div className="admin-pagination">
        <span>
          {filtered.length} tài khoản · Trang {currentPage}/{pages}
        </span>
        <div>
          <button
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Trước
          </button>
          <button
            disabled={currentPage === pages}
            onClick={() => setPage(currentPage + 1)}
          >
            Sau
          </button>
        </div>
      </div>
      <p className="form-hint">
        Khóa tài khoản ngăn các thao tác cần đăng nhập. Gói VIP là nhãn quản lý,
        không cấp quyền admin hay tự bật tính năng trả phí.
      </p>
    </section>
  );
}
