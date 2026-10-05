"use client";

import { useMemo, useRef, useState } from "react";
import {
  ExternalLink,
  Pencil,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import type { Viewer } from "@/lib/admin-data";
import type { EditViewer, PatchViewer } from "@/components/admin/types";
import { getCultivation, cultivationRealms } from "@/lib/cultivation";
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
  const [realmFilter, setRealmFilter] = useState("Tất cả");
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

  const highCultivationCount = useMemo(
    () => viewers.filter((v) => (v.cultivationXp ?? 0) >= 80).length,
    [viewers],
  );

  const filtered = useMemo(() => {
    return viewers.filter((viewer: Viewer) => {
      const matched = `${viewer.name} ${viewer.email}`
        .toLowerCase()
        .includes(keyword.toLowerCase());
      const matchedStatus =
        status === "Tất cả" ||
        viewer.status === status ||
        viewer.plan === status;
      const viewerRealmTitle = getCultivation(
        viewer.cultivationXp ?? 0,
      ).title;
      const matchedRealm =
        realmFilter === "Tất cả" || viewerRealmTitle.includes(realmFilter);

      return matched && matchedStatus && matchedRealm;
    });
  }, [viewers, keyword, status, realmFilter]);

  const pages = Math.max(1, Math.ceil(filtered.length / 20));
  const currentPage = Math.min(page, pages);
  const list = filtered.slice((currentPage - 1) * 20, currentPage * 20);

  return (
    <section className="admin-users">
      {/* Summary Stat Strip */}
      <div className="admin-summary-strip user-stat-strip">
        <article>
          <div className="stat-strip-icon user-icon">
            <Users />
          </div>
          <span>
            Tổng tài khoản
            <strong>{viewers.length}</strong>
          </span>
        </article>

        <article>
          <div className="stat-strip-icon active-icon">
            <UserCheck />
          </div>
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
          <div className="stat-strip-icon vip-icon">
            <Star />
          </div>
          <span>
            Thành viên VIP
            <strong>
              {viewers.filter((viewer: Viewer) => viewer.plan === "VIP").length}
            </strong>
          </span>
        </article>

        <article>
          <div className="stat-strip-icon realm-icon">
            <Sparkles />
          </div>
          <span>
            Cao thủ Trúc Cơ+
            <strong>{highCultivationCount}</strong>
          </span>
        </article>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-toolbar user-toolbar">
        <div className="catalog-search">
          <Search size={16} />
          <input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên đạo hữu hoặc email..."
          />
        </div>

        <div className="admin-filters">
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            title="Lọc trạng thái hoặc gói cước"
          >
            <option value="Tất cả">Tất cả trạng thái / gói</option>
            <option value="Đang hoạt động">Đang hoạt động</option>
            <option value="Đã khóa">Đã khóa</option>
            <option value="VIP">Thành viên VIP</option>
            <option value="Miễn phí">Thành viên Miễn phí</option>
          </select>

          <select
            value={realmFilter}
            onChange={(event) => {
              setRealmFilter(event.target.value);
              setPage(1);
            }}
            title="Lọc theo cảnh giới tu vi"
          >
            <option value="Tất cả">Tất cả cảnh giới</option>
            {cultivationRealms.slice(0, 10).map((realm) => (
              <option key={realm.name} value={realm.name}>
                {realm.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Đạo hữu / Khán giả</th>
              <th>Vai trò</th>
              <th>Gói thành viên</th>
              <th>Trạng thái</th>
              <th>Ngày gia nhập</th>
              <th>Lượt xem & Hoạt động</th>
              <th>Cảnh giới Tiên Lộ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((viewer: Viewer) => {
              const realm = getCultivation(viewer.cultivationXp ?? 0);
              return (
                <tr key={viewer.id}>
                  <td>
                    <div className="user-table-cell">
                      <UserAvatar
                        name={viewer.name}
                        userId={viewer.id}
                        avatarId={viewer.avatarId}
                        avatarVersion={viewer.avatarVersion}
                        frameId={viewer.avatarFrameId}
                        cultivationXp={viewer.cultivationXp}
                      />
                      <div className="user-cell-copy">
                        <strong className="user-display-name">
                          {viewer.name}
                        </strong>
                        <small className="user-email-text">{viewer.email}</small>
                        {viewer.role === "user" && (
                          <span className="user-auth-badge">
                            {viewer.hasLogin ? "✓ Đã liên kết" : "Hồ sơ lưu trữ"}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`role-badge ${viewer.role === "admin" ? "admin" : "member"}`}
                    >
                      <ShieldCheck size={13} />
                      {viewer.role === "admin" ? "Quản trị" : "Khán giả"}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className={`plan-badge ${viewer.plan === "VIP" ? "vip" : ""}`}
                      disabled={pending.includes(viewer.id)}
                      onClick={() =>
                        void act(viewer.id, () =>
                          patch(viewer.id, {
                            plan: viewer.plan === "VIP" ? "Miễn phí" : "VIP",
                          }),
                        )
                      }
                      title="Click để chuyển đổi giữa gói VIP và Miễn phí"
                    >
                      {viewer.plan === "VIP" ? "★ VIP" : "Miễn phí"}
                    </button>
                  </td>

                  <td>
                    <button
                      type="button"
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
                      title={
                        viewer.role === "admin"
                          ? "Không thể khóa tài khoản quản trị"
                          : "Click để Khóa hoặc Mở khóa tài khoản"
                      }
                    >
                      <i />
                      {viewer.status}
                    </button>
                  </td>

                  <td>
                    {new Date(viewer.joinedAt).toLocaleDateString("vi-VN")}
                  </td>

                  <td>
                    <b>{viewer.watches} lượt xem</b>
                    <small>
                      {new Date(viewer.lastActive).toLocaleDateString("vi-VN")}
                    </small>
                  </td>

                  <td>
                    <div className="realm-table-cell">
                      <span className="cultivation-pill">{realm.title}</span>
                      <small>{viewer.cultivationXp ?? 0} đạo hạnh</small>
                      {viewer.publicId && (
                        <a
                          href={`/nguoi-dung/${viewer.publicId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-public-profile-link"
                          title="Mở trang hồ sơ cá nhân công khai"
                        >
                          <ExternalLink size={11} /> Hồ sơ
                        </a>
                      )}
                    </div>
                  </td>

                  <td>
                    <div className="table-row-actions">
                      <button
                        type="button"
                        className="table-action-icon"
                        title="Chỉnh sửa tài khoản"
                        disabled={pending.includes(viewer.id)}
                        onClick={() => edit(viewer)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="table-action-icon delete-icon"
                        disabled={
                          viewer.role === "admin" || pending.includes(viewer.id)
                        }
                        title={
                          viewer.role === "admin"
                            ? "Không thể xóa tài khoản quản trị viên"
                            : "Xóa tài khoản này"
                        }
                        onClick={() =>
                          void act(viewer.id, () => remove(viewer.id))
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!list.length && (
          <div className="admin-empty">
            <Users size={32} />
            <b>Không có tài khoản phù hợp</b>
            <span>Thử thay đổi từ khóa hoặc bộ lọc cảnh giới.</span>
          </div>
        )}
      </div>

      {filtered.length > 20 && (
        <div className="admin-pagination">
          <span>
            {filtered.length} tài khoản · Trang {currentPage}/{pages}
          </span>
          <div>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Trước
            </button>
            <button
              type="button"
              disabled={currentPage === pages}
              onClick={() => setPage(currentPage + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      )}

      <p className="form-hint">
        💡 Mẹo vận hành: Click trực tiếp vào nút <strong>Gói</strong> hoặc{" "}
        <strong>Trạng thái</strong> để thay đổi nhanh mà không cần mở form chỉnh
        sửa.
      </p>
    </section>
  );
}
