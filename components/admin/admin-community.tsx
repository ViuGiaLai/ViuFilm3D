"use client";
import { useEffect, useState, useRef } from "react";
import { adminGateway } from "@/lib/admin-gateway";
import { avatarFrames, frameGroups } from "@/lib/avatar-frames";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { Viewer } from "@/lib/admin-data";
import type { WorldModeration } from "@/lib/admin-community";
import { adminDataCache } from "@/lib/admin-cache";

export default function AdminCommunity({
  section,
  viewers,
  support,
}: {
  section: "frames" | "world" | "audit";
  viewers: Viewer[];
  support: (v: Viewer) => void;
}) {
  const [items, setItems] = useState<WorldModeration[]>(
    adminDataCache.worldMessages?.items ?? [],
  );
  const [audit, setAudit] = useState<
    Awaited<ReturnType<typeof adminGateway.communityAudit>>
  >(adminDataCache.auditLogs ?? []);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(
    adminDataCache.worldMessages?.hasMore ?? false,
  );
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);

  useEffect(() => {
    let active = true;
    setError("");
    if (section === "frames") return;

    const hasData =
      section === "world" ? items.length > 0 : audit.length > 0;
    if (!hasData) setLoading(true);

    void (
      section === "world"
        ? adminGateway.worldMessages(page * 50, status, q)
        : adminGateway.communityAudit()
    )
      .then(
        (value) => {
          if (!active) return;
          if (Array.isArray(value)) {
            adminDataCache.auditLogs = value;
            setAudit(value);
          } else {
            if (page === 0 && status === "all" && !q) {
              adminDataCache.worldMessages = value;
            }
            setItems(value.items);
            setHasMore(value.hasMore);
          }
        },
        (e) => {
          if (active && !hasData)
            setError(
              e instanceof Error ? e.message : "Không thể tải dữ liệu.",
            );
        },
      )
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [section, page, status, q, revision]);
  const moderate = async (row: WorldModeration) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    const nextStatus = row.status === "visible" ? "hidden" : "visible";
    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) =>
        item.id === row.id ? { ...item, status: nextStatus } : item,
      ),
    );
    try {
      await adminGateway.moderateWorld(row.id, nextStatus, reason);
      setSelected(null);
      setReason("");
      setRevision((v) => v + 1);
    } catch (e) {
      // Revert on error
      setItems((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, status: row.status } : item,
        ),
      );
      setError(e instanceof Error ? e.message : "Chưa thể kiểm duyệt.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <section className="admin-community">
      <p className="form-hint">
        {section === "world"
          ? "Chỉ kiểm duyệt kênh chung Thế Giới. Không truy cập mật thư giữa bằng hữu."
          : section === "frames"
            ? "37 viền trong 5 bộ sưu tập. Admin sở hữu toàn bộ; đạo hữu mở bằng đạo hạnh hoặc được cấp riêng."
            : "50 thao tác cộng đồng gần nhất, lưu người thực hiện, lý do và dữ liệu trước/sau."}
      </p>
      {section === "frames" ? (
        <>
          <label className="admin-support-select">
            Chọn đạo hữu để cấp/thu hồi viền hoặc chỉnh cảnh giới
            <select
              value=""
              onChange={(e) => {
                const v = viewers.find((v) => v.id === Number(e.target.value));
                if (v) support(v);
              }}
            >
              <option value="">Chọn tài khoản…</option>
              {viewers.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} · #{v.id}
                </option>
              ))}
            </select>
          </label>
          {frameGroups.map((group) => (
            <div key={group}>
              <h2>{group}</h2>
              <div className="admin-frame-grid">
                {avatarFrames
                  .filter((f) => f.group === group)
                  .map((f) => (
                    <article className="admin-frame-option" key={f.id}>
                      <UserAvatar
                        name={f.name}
                        avatarId="moon"
                        frameId={f.id}
                      />
                      <span>
                        <strong>{f.name}</strong>
                        <small>
                          {f.minXp} đạo hạnh · {f.id}
                        </small>
                      </span>
                    </article>
                  ))}
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          {section === "world" && (
            <div className="admin-toolbar">
              <input
                value={q}
                maxLength={100}
                placeholder="Tìm nội dung luận đạo…"
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(0);
                  setSelected(null);
                }}
              />
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(0);
                  setSelected(null);
                }}
              >
                <option value="all">Tất cả</option>
                <option value="visible">Đang hiện</option>
                <option value="hidden">Đã ẩn</option>
              </select>
            </div>
          )}
          <button
            className="admin-refresh"
            disabled={loading}
            onClick={() => setRevision((v) => v + 1)}
          >
            Tải lại dữ liệu
          </button>
          {loading ? (
            <p>Đang tải…</p>
          ) : section === "world" ? (
            <div className="admin-world-list">
              {items.map((row) => (
                <article key={row.id}>
                  <header>
                    <UserAvatar
                      name={row.authorName}
                      userId={row.senderId}
                      avatarId={row.avatarId}
                      avatarVersion={row.avatarVersion}
                      frameId={row.avatarFrameId}
                    />
                    <div>
                      <strong>{row.authorName}</strong>
                      <small>
                        {new Date(row.createdAt).toLocaleString("vi-VN")} ·{" "}
                        {row.status === "hidden" ? "Đã ẩn" : "Đang hiện"}
                      </small>
                    </div>
                  </header>
                  <p>{row.body}</p>
                  {selected === row.id ? (
                    <div>
                      <textarea
                        value={reason}
                        required
                        minLength={3}
                        maxLength={300}
                        placeholder="Lý do kiểm duyệt…"
                        onChange={(e) => setReason(e.target.value)}
                      />
                      <button
                        disabled={busy || reason.trim().length < 3}
                        onClick={() => void moderate(row)}
                      >
                        {busy
                          ? "Đang lưu…"
                          : row.status === "visible"
                            ? "Xác nhận ẩn"
                            : "Khôi phục lời luận đạo"}
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => {
                          setSelected(null);
                          setReason("");
                        }}
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button
                      disabled={busy}
                      onClick={() => {
                        setSelected(row.id);
                        setReason("");
                      }}
                    >
                      {row.status === "visible"
                        ? "Ẩn lời luận đạo"
                        : "Khôi phục"}
                    </button>
                  )}
                </article>
              ))}
              {!items.length && !error && <p>Không có lời luận đạo phù hợp.</p>}
            </div>
          ) : (
            <div className="admin-world-list">
              {audit.map((row) => (
                <article key={row.id}>
                  <strong>
                    {row.action === "profile_support"
                      ? "Hỗ trợ hồ sơ"
                      : "Kiểm duyệt Thế Giới"}{" "}
                    · #{row.target_id}
                  </strong>
                  <small>
                    {row.actor_email} ·{" "}
                    {new Date(row.created_at).toLocaleString("vi-VN")}
                  </small>
                  <p>{row.reason}</p>
                  <details>
                    <summary>Dữ liệu trước/sau</summary>
                    <pre>
                      {JSON.stringify(
                        { truoc: row.before_data, sau: row.after_data },
                        null,
                        2,
                      )}
                    </pre>
                  </details>
                </article>
              ))}
              {!audit.length && !error && (
                <p>Chưa có thao tác được ghi nhận.</p>
              )}
            </div>
          )}
          {section === "world" && (
            <div className="admin-pagination">
              <button
                disabled={loading || page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Trước
              </button>
              <span>Trang {page + 1}</span>
              <button
                disabled={loading || !hasMore}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
