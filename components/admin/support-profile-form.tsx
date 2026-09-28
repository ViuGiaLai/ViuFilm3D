"use client";
import { useEffect, useRef, useState } from "react";
import { X, Save } from "lucide-react";
import type { Viewer } from "@/lib/admin-data";
import { adminGateway } from "@/lib/admin-gateway";
import { supportProfile } from "@/lib/admin-community";
import { avatarFrames, frameGroups } from "@/lib/avatar-frames";
import { avatarOptions } from "@/lib/social-types";
import { cultivationRealms, getCultivation } from "@/lib/cultivation";
import { UserAvatar } from "@/components/ui/user-avatar";
export default function SupportProfileForm({
  viewer,
  close,
  saved,
}: {
  viewer: Viewer;
  close: () => void;
  saved: () => Promise<void>;
}) {
  const [form, setForm] = useState(() => supportProfile(viewer));
  const [frameGroup, setFrameGroup] = useState<string>("Cảnh giới");
  const [frameQuery, setFrameQuery] = useState("");
  const selectedFrame =
    avatarFrames.find((f) => f.id === form.avatarFrameId) ?? avatarFrames[0];
  const [reason, setReason] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const modal = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modal.current?.querySelector<HTMLButtonElement>(".modal-close")?.focus();
    const keys = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !lock.current) close();
      if (e.key !== "Tab") return;
      const nodes = [
        ...(modal.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),summary,[tabindex="0"]',
        ) ?? []),
      ].filter((el) => el.getClientRects().length);
      if (!nodes.length) return;
      if (e.shiftKey && document.activeElement === nodes[0]) {
        e.preventDefault();
        nodes.at(-1)?.focus();
      } else if (!e.shiftKey && document.activeElement === nodes.at(-1)) {
        e.preventDefault();
        nodes[0].focus();
      }
    };
    document.addEventListener("keydown", keys);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", keys);
      previous?.focus();
    };
  }, [close]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await adminGateway.supportProfile(
        viewer.id,
        supportProfile(viewer),
        form,
        reason,
      );
      await saved();
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa thể lưu hồ sơ.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <div className="modal-layer">
      <form
        ref={modal}
        className="movie-form admin-support-form"
        onSubmit={save}
        aria-label="Hỗ trợ đạo hữu"
        role="dialog"
        aria-modal="true"
      >
        <header className="admin-support-header">
          <button
            type="button"
            className="modal-close"
            onClick={close}
            disabled={busy}
            aria-label="Đóng hỗ trợ"
          >
            <X />
          </button>
          <p className="mini-label">HỖ TRỢ ĐẠO HỮU · #{viewer.id}</p>
          <h2>Hồ sơ & tiên lộ</h2>
        </header>
        <fieldset disabled={busy} className="admin-support-body">
          <div
            className="admin-support-fields"
            role="region"
            aria-label="Thông tin hồ sơ — cuộn độc lập"
            tabIndex={0}
          >
            <div className="admin-support-preview">
              <UserAvatar
                size="large"
                userId={viewer.id}
                avatarVersion={viewer.avatarVersion}
                avatarId={form.avatarId}
                frameId={form.avatarFrameId}
                name={form.name}
              />
              <div>
                <strong>{form.name}</strong>
                <p>{getCultivation(form.cultivationXp).title}</p>
                <small>
                  {viewer.role === "admin"
                    ? "Quản trị: sở hữu mọi viền, không cần mở khóa."
                    : "Viền được mở bằng đạo hạnh hoặc cấp riêng."}
                </small>
              </div>
            </div>
            <label>
              Đạo danh
              <input
                required
                minLength={2}
                maxLength={100}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Giới thiệu
              <textarea
                maxLength={300}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </label>
            <div className="form-two">
              <label>
                Avatar
                <select
                  value={form.avatarId}
                  onChange={(e) =>
                    setForm({ ...form, avatarId: e.target.value })
                  }
                >
                  {avatarOptions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                  {viewer.avatarVersion && (
                    <option value="upload">Ảnh đạo hữu đã tải lên</option>
                  )}
                </select>
              </label>
              <label>
                Đạo hạnh (0–1.000.000)
                <input
                  type="number"
                  min={0}
                  max={1000000}
                  required
                  value={form.cultivationXp}
                  onChange={(e) =>
                    setForm({ ...form, cultivationXp: Number(e.target.value) })
                  }
                />
              </label>
            </div>
            <label>
              Đặt cảnh giới nhanh
              <select
                value=""
                onChange={(e) =>
                  e.target.value &&
                  setForm({ ...form, cultivationXp: Number(e.target.value) })
                }
              >
                <option value="">Chọn cảnh giới và giai đoạn…</option>
                {cultivationRealms.flatMap((r, i) =>
                  ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ", "Viên Mãn"].map(
                    (phase, p) => {
                      const xp = Math.ceil(
                        r.start +
                          (((cultivationRealms[i + 1]?.start ??
                            r.start + 1200) -
                            r.start) *
                            p) /
                            4,
                      );
                      return (
                        <option key={xp} value={xp}>
                          {r.name} {phase} · {xp}
                        </option>
                      );
                    },
                  ),
                )}
              </select>
            </label>
            <section
              className="admin-equipped-frame"
              aria-label="Viền đang trang bị"
            >
              <UserAvatar
                avatarId={form.avatarId}
                userId={viewer.id}
                avatarVersion={viewer.avatarVersion}
                name={form.name}
                frameId={selectedFrame.id}
              />
              <div>
                <small>VIỀN ĐANG TRANG BỊ</small>
                <strong>{selectedFrame.name}</strong>
                <span>
                  {selectedFrame.group} · {selectedFrame.minXp} đạo hạnh
                </span>
              </div>
            </section>
            <p className="form-hint">
              Nếu giảm đạo hạnh hoặc thu hồi quyền cấp riêng khiến viền đang
              dùng không còn đủ điều kiện, hệ thống sẽ tháo viền. Admin luôn
              được dùng mọi viền.
            </p>
          </div>
          <section
            className="admin-support-collection"
            aria-label="Bộ sưu tập viền — cuộn độc lập"
            tabIndex={0}
          >
            <div className="admin-collection-controls">
              <h3>Bộ sưu tập viền</h3>
              <p className="form-hint">
                {viewer.role === "admin"
                  ? "Quản trị sở hữu toàn bộ viền. Bấm vào hình để trang bị."
                  : `${form.frameGrants.length} viền được cấp riêng · bấm hình để trang bị; ô cấp riêng là quyền sử dụng bổ sung.`}
              </p>
              <label className="admin-frame-search">
                Tìm viền
                <input
                  value={frameQuery}
                  maxLength={100}
                  onChange={(e) => setFrameQuery(e.target.value)}
                  placeholder="Tên viền hoặc cảnh giới…"
                />
              </label>
              <div className="admin-frame-groups" aria-label="Lọc bộ sưu tập">
                {["Tất cả", ...frameGroups].map((group) => (
                  <button
                    type="button"
                    key={group}
                    aria-pressed={frameGroup === group}
                    onClick={() => setFrameGroup(group)}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>
            <div
              className="admin-visual-frame-grid"
              aria-label="Chọn viền bằng hình"
            >
              {avatarFrames
                .filter(
                  (f) =>
                    (frameGroup === "Tất cả" || f.group === frameGroup) &&
                    f.name
                      .toLocaleLowerCase("vi")
                      .includes(frameQuery.trim().toLocaleLowerCase("vi")),
                )
                .map((f) => {
                  const granted = form.frameGrants.includes(f.id);
                  const eligible =
                    viewer.role === "admin" ||
                    form.cultivationXp >= f.minXp ||
                    granted;
                  const equipped = form.avatarFrameId === f.id;
                  return (
                    <article
                      key={f.id}
                      className={`admin-visual-frame ${equipped ? "is-equipped" : ""}`}
                    >
                      <button
                        type="button"
                        className="admin-frame-equip"
                        aria-pressed={equipped}
                        aria-label={`Trang bị viền ${f.name}`}
                        disabled={!eligible}
                        onClick={() =>
                          setForm({ ...form, avatarFrameId: f.id })
                        }
                      >
                        <UserAvatar
                          avatarId={form.avatarId}
                          userId={viewer.id}
                          avatarVersion={viewer.avatarVersion}
                          name={form.name}
                          frameId={f.id}
                        />
                        <strong>{f.name}</strong>
                        <small>
                          {f.group} · {f.minXp} đạo hạnh
                        </small>
                        <span className="admin-frame-state">
                          {equipped
                            ? "✓ Đang trang bị"
                            : eligible
                              ? "Đã mở · bấm để chọn"
                              : "Cần cấp riêng hoặc đủ đạo hạnh"}
                        </span>
                      </button>
                      {viewer.role !== "admin" && f.id !== "none" && (
                        <label className="admin-frame-grant">
                          <input
                            type="checkbox"
                            checked={granted}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                frameGrants: e.target.checked
                                  ? [...form.frameGrants, f.id]
                                  : form.frameGrants.filter(
                                      (id) => id !== f.id,
                                    ),
                              })
                            }
                          />
                          Cấp quyền dùng riêng
                        </label>
                      )}
                    </article>
                  );
                })}
            </div>
            {!avatarFrames.some(
              (f) =>
                (frameGroup === "Tất cả" || f.group === frameGroup) &&
                f.name
                  .toLocaleLowerCase("vi")
                  .includes(frameQuery.trim().toLocaleLowerCase("vi")),
            ) && <p className="form-hint">Không tìm thấy viền phù hợp.</p>}
          </section>
        </fieldset>
        <footer className="admin-support-footer">
          <label>
            Lý do hỗ trợ (bắt buộc, ghi vào nhật ký)
            <textarea
              disabled={busy}
              required
              minLength={3}
              maxLength={300}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ví dụ: đạo hữu yêu cầu điều chỉnh avatar…"
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="admin-support-footer-actions">
            <button
              type="button"
              className="secondary-btn"
              disabled={busy}
              onClick={close}
            >
              Hủy
            </button>
            <button
              className="primary-btn"
              disabled={busy || reason.trim().length < 3}
            >
              <Save />
              {busy ? "Đang lưu…" : "Lưu hỗ trợ & ghi nhật ký"}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}
