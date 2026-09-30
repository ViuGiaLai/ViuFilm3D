"use client";

import { useEffect, useRef, useState } from "react";
import {
  Heart,
  History,
  LogOut,
  UserRound,
  X,
  Save,
  ShieldCheck,
  ImagePlus,
  Palette,
  Sparkles,
} from "lucide-react";
import { BrandLogo as Logo } from "@/components/ui/brand-logo";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  CultivationBadge,
  CultivationProgress,
} from "@/components/ui/cultivation-badge";
import { avatarOptions } from "@/lib/social-types";
import { avatarFrames, frameGroups } from "@/lib/avatar-frames";
import { avatarFileProblem, hasUploadedAvatar } from "@/lib/profile-validation";
import { adminGateway } from "@/lib/admin-gateway";
import type { Account } from "@/lib/app-types";
import { authGateway } from "@/lib/auth-gateway";
import {
  storageKeys as storage,
  writeStorage as write,
} from "@/lib/client-storage";
import { apiMode } from "@/lib/config";
import { ApiRequestError } from "@/lib/api-client";
import type { Dispatch, SetStateAction } from "react";
import type { Navigate } from "@/components/site/types";

type LoginPageProps = {
  onLogin: (account: Account) => void;
  close: () => void;
  allowRegistration?: boolean;
};

export default function LoginPage({
  onLogin,
  close,
  allowRegistration = false,
}: LoginPageProps) {
  const isProduction = apiMode === "production";
  const [registering, setRegistering] = useState(false);
  const [needResendConfirm, setNeedResendConfirm] = useState(false);
  const [name, setName] = useState("");
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState(isProduction ? "" : "user@gmail.com"),
    [password, setPassword] = useState(isProduction ? "" : "123456"),
    [error, setError] = useState(""),
    [submitting, setSubmitting] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    if (apiMode === "production") {
      try {
        if (registering) {
          const result = await authGateway.register(
            name.trim(),
            email.trim().toLowerCase(),
            password,
          );
          if (result.userAlreadyExists) {
            setNotice(
              "Tài khoản đã tồn tại. Nếu bạn chưa xác nhận email, hãy gửi lại email xác nhận.",
            );
            setNeedResendConfirm(true);
            setRegistering(false);
            return;
          }
          if (result.confirmationRequired) {
            setNotice(
              "Tài khoản đã được gửi yêu cầu đăng ký. Hãy kiểm tra email xác nhận, sau đó đăng nhập.",
            );
            setRegistering(false);
          } else {
            const account = await authGateway.login(
              email.trim().toLowerCase(),
              password,
            );
            if (account) onLogin(account);
          }
          return;
        }
        const account = await authGateway.login(
          email.trim().toLowerCase(),
          password,
        );
        if (account) onLogin(account);
      } catch (submitError) {
        setError(
          submitError instanceof ApiRequestError && submitError.status === 401
            ? submitError.message
            : registering
              ? "Không thể đăng ký lúc này. Vui lòng thử lại sau."
              : "Không thể đăng nhập lúc này. Vui lòng thử lại sau.",
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }
    const viewers = await adminGateway.listViewers();
    const viewer = viewers.find(
      (item) => item.email === email.trim().toLowerCase(),
    );
    if (!viewer || password !== "123456") {
      setError("Email hoặc mật khẩu không chính xác.");
      setSubmitting(false);
      return;
    }
    if (viewer.status === "Đã khóa") {
      setError("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.");
      setSubmitting(false);
      return;
    }
    onLogin({ email: viewer.email, name: viewer.name, role: viewer.role });
    setSubmitting(false);
  };
  
  const resendConfirmation = async () => {
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      await authGateway.resendConfirmation(email.trim().toLowerCase());
      setNotice("Email xác nhận đã được gửi lại. Vui lòng kiểm tra hộp thư.");
      setNeedResendConfirm(false);
    } catch (submitError) {
      setError(
        submitError instanceof ApiRequestError
          ? submitError.message
          : "Không thể gửi lại email xác nhận lúc này."
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <main className="login-page">
      <section className="login-art">
        <Logo />
        <div>
          <p className="mini-label">THẾ GIỚI HOẠT HÌNH 3D</p>
          <h1>
            Mỗi khung hình,
            <br />
            <em>một thế giới mới.</em>
          </h1>
          <span>
            Thư viện phim nguyên bản và nội dung minh họa được lưu trực tiếp
            trong hệ thống.
          </span>
        </div>
      </section>
      <form onSubmit={submit}>
        <button type="button" className="login-close" onClick={close}>
          <X />
        </button>
        <p className="mini-label">TÀI KHOẢN VIUFILM3D</p>
        <h2>{registering ? "Tạo tài khoản người xem" : "Chào mừng trở lại"}</h2>
        <span>
          {isProduction
            ? registering
              ? "Đăng ký để bình luận, lưu phim yêu thích và tiếp tục xem trên thiết bị khác."
              : "Đăng nhập để quản lý phim yêu thích, lịch sử xem và bình luận."
            : "Đăng nhập để dùng dữ liệu tài khoản mẫu trên trình duyệt."}
        </span>
        {registering && (
          <label>
            Tên hiển thị
            <input
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
              setNeedResendConfirm(false);
            }}
          />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            required
            minLength={registering ? 8 : undefined}
            autoComplete={registering ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        {notice && (
          <p className="form-notice" role="status">
            {notice}
          </p>
        )}
        <button
          type="submit"
          className="primary-btn full"
          disabled={submitting || needResendConfirm}
        >
          {submitting
            ? "Đang xử lý..."
            : registering
              ? "Tạo tài khoản"
              : "Đăng nhập"}
        </button>
        {needResendConfirm && (
          <button
            type="button"
            className="glass-btn full"
            style={{ marginTop: "0.5rem" }}
            onClick={resendConfirmation}
            disabled={submitting}
          >
            Gửi lại email xác nhận
          </button>
        )}
        {isProduction && allowRegistration && (
          <button
            type="button"
            className="auth-mode-toggle"
            onClick={() => {
              setRegistering((value) => !value);
              setError("");
              setNotice("");
              setNeedResendConfirm(false);
            }}
          >
            {registering
              ? "Đã có tài khoản? Đăng nhập"
              : "Chưa có tài khoản? Đăng ký"}
          </button>
        )}
        {!isProduction && (
          <div className="demo-accounts-box">
            <span>Tài khoản mẫu thử nghiệm (Mock mode):</span>
            <div className="demo-btns">
              <button
                type="button"
                className="demo-btn"
                onClick={() => {
                  setEmail("user@gmail.com");
                  setPassword("123456");
                  setError("");
                }}
              >
                👤 Người xem (user@gmail.com)
              </button>
              <button
                type="button"
                className="demo-btn admin"
                onClick={() => {
                  setEmail("admin@gmail.com");
                  setPassword("123456");
                  setError("");
                }}
              >
                🛡️ Quản trị viên (admin@gmail.com)
              </button>
            </div>
            <small>Mật khẩu: 123456</small>
          </div>
        )}
      </form>
    </main>
  );
}
type ProfilePageProps = {
  user: Account;
  setUser: Dispatch<SetStateAction<Account | null>>;
  go: Navigate;
  logout: () => void;
};

export function ProfilePage({ user, setUser, go, logout }: ProfilePageProps) {
  const [name, setName] = useState(user.name),
    [avatarId, setAvatarId] = useState(user.avatarId ?? "moon"),
    [avatarFrameId, setAvatarFrameId] = useState(user.avatarFrameId ?? "none"),
    [bio, setBio] = useState(user.bio ?? ""),
    [uploading, setUploading] = useState(false),
    [saving, setSaving] = useState(false),
    [saved, setSaved] = useState(false),
    [effectsEnabled, setEffectsEnabled] = useState(true),
    [effectsPaused, setEffectsPaused] = useState(false),
    [error, setError] = useState("");
  const requestVersion = useRef(0);
  const mounted = useRef(true);
  const busy = useRef(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    mounted.current = true;
    const visibility = () =>
      setEffectsPaused(document.visibilityState !== "visible");
    visibility();
    try {
      const stored = localStorage.getItem("viufilm3d-profile-effects");
      setEffectsEnabled(
        stored === null
          ? !window.matchMedia("(prefers-reduced-motion: reduce)").matches
          : stored !== "off",
      );
    } catch {
      /* Storage may be blocked; CSS still respects reduced motion. */
    }
    document.addEventListener("visibilitychange", visibility);
    return () => {
      mounted.current = false;
      document.removeEventListener("visibilitychange", visibility);
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);
  const toggleEffects = () => {
    const next = !effectsEnabled;
    setEffectsEnabled(next);
    try {
      localStorage.setItem("viufilm3d-profile-effects", next ? "on" : "off");
    } catch {
      /* Optional preference. */
    }
  };
  useEffect(() => {
    if (apiMode !== "production") return;
    let active = true;
    const version = requestVersion.current;
    void authGateway
      .session()
      .then((account) => {
        if (active && account && version === requestVersion.current)
          setUser(account);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [setUser]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    requestVersion.current++;
    setSaving(true);
    setError("");
    try {
      const next =
        apiMode === "production"
          ? await authGateway.updateProfile(
              name.trim(),
              avatarId,
              bio.trim(),
              avatarFrameId,
            )
          : {
              ...user,
              name: name.trim(),
              avatarId,
              avatarFrameId,
              bio: bio.trim(),
            };
      if (!mounted.current) return;
      setUser(next);
      if (apiMode === "mock") write(storage.user, next);
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 2000);
    } catch (saveError) {
      if (mounted.current)
        setError(
          saveError instanceof ApiRequestError &&
            [400, 503].includes(saveError.status)
            ? saveError.message
            : "Chưa thể lưu hồ sơ. Vui lòng thử lại sau.",
        );
    } finally {
      busy.current = false;
      if (mounted.current) setSaving(false);
    }
  };
  const uploadAvatar = async (file?: File) => {
    if (!file || busy.current) return;
    const fileProblem = avatarFileProblem(file);
    if (fileProblem) {
      setError(fileProblem);
      return;
    }
    busy.current = true;
    requestVersion.current++;
    setError("");
    setUploading(true);
    try {
      const next = await authGateway.uploadAvatar(file);
      if (!mounted.current) return;
      setUser(next);
      setAvatarId("upload");
    } catch {
      if (mounted.current)
        setError(
          "Không thể tải ảnh lên. Chọn ảnh JPEG, PNG hoặc WebP dưới 2 MB.",
        );
    } finally {
      busy.current = false;
      if (mounted.current) setUploading(false);
    }
  };
  const dirty =
    name.trim() !== user.name ||
    avatarId !== (user.avatarId ?? "moon") ||
    avatarFrameId !== (user.avatarFrameId ?? "none") ||
    bio.trim() !== (user.bio ?? "");
  const resetDraft = () => {
    setName(user.name);
    setAvatarId(user.avatarId ?? "moon");
    setAvatarFrameId(user.avatarFrameId ?? "none");
    setBio(user.bio ?? "");
    setError("");
  };
  return (
    <main
      className={`page-shell profile account-page ${!effectsEnabled ? "account-page--quiet" : ""}`}
      data-effects-paused={effectsPaused}
    >
      <div className="account-heading">
        <span>KHÔNG GIAN CÁ NHÂN</span>
        <h1>Tài khoản của bạn</h1>
        <p>Quản lý hồ sơ, diện mạo và hành trình tiên lộ.</p>
        <button
          type="button"
          className="account-motion-control"
          aria-pressed={effectsEnabled}
          onClick={toggleEffects}
          title="Bật/tắt chuyển động; không thay đổi viền đã chọn"
        >
          <Sparkles size={15} /> Hiệu ứng: {effectsEnabled ? "Bật" : "Tắt"}
        </button>
      </div>
      <section className="account-hero" aria-label="Xem trước hồ sơ">
        <div className="account-cover" aria-hidden="true" />
        <div className="account-identity">
          <UserAvatar
            avatarId={avatarId}
            avatarVersion={user.avatarVersion}
            userId={user.id}
            name={name}
            size="large"
            frameId={avatarFrameId}
            cultivationXp={user.cultivationXp}
          />
          <div className="account-identity-copy">
            <span className="mini-label">ĐẠO HỮU VIUFILM3D</span>
            <h2>{name || "Tên hiển thị của bạn"}</h2>
            <div className="account-identity-badges">
              {user.publicId && <CultivationBadge xp={user.cultivationXp} />}
              <span>
                {user.role === "admin" ? "Quản trị viên" : "Thành viên"}
              </span>
            </div>
            <p>{bio || "Thêm lời giới thiệu để đạo hữu biết thêm về bạn."}</p>
          </div>
          {user.publicId && (
            <button
              className="account-public-link"
              onClick={() => go(`/nguoi-dung/${user.publicId}`)}
            >
              <UserRound size={17} /> Hồ sơ công khai
            </button>
          )}
        </div>
      </section>
      <div className="account-layout">
        <aside className="account-sidebar">
          {apiMode === "mock" || user.publicId ? (
            <CultivationProgress xp={user.cultivationXp} />
          ) : (
            <p className="form-notice">
              Cảnh giới và bộ sưu tập viền chưa được kích hoạt trên hệ thống.
            </p>
          )}
          <nav className="account-shortcuts" aria-label="Thư viện cá nhân">
            <h2>Thư viện của bạn</h2>
            <button onClick={() => go("/yeu-thich")}>
              <Heart size={18} />
              <span>
                Phim yêu thích<small>Những bộ phim đã lưu</small>
              </span>
              <span aria-hidden="true">›</span>
            </button>
            <button onClick={() => go("/lich-su")}>
              <History size={18} />
              <span>
                Lịch sử xem<small>Tiếp tục hành trình đang xem</small>
              </span>
              <span aria-hidden="true">›</span>
            </button>
            <button className="account-logout" onClick={logout}>
              <LogOut size={18} />
              <span>Đăng xuất</span>
            </button>
          </nav>
          <div className="account-privacy">
            <ShieldCheck size={20} />
            <p>
              Email chỉ dùng cho tài khoản của bạn, không hiển thị trên hồ sơ
              công khai hay bình luận.
            </p>
          </div>
        </aside>
        <form className="account-editor" onSubmit={submit}>
          <div className="account-editor-heading">
            <h2>Chỉnh sửa hồ sơ</h2>
            <p>
              Ảnh đại diện, tên và giới thiệu sẽ xuất hiện cùng bình luận của
              bạn.
            </p>
          </div>
          <section className="account-form-section">
            <h3>
              <UserRound size={18} /> Thông tin cơ bản
            </h3>
            <div className="account-fields-row">
              <label>
                Tên hiển thị
                <input
                  value={name}
                  minLength={2}
                  maxLength={100}
                  required
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Tên của bạn"
                />
              </label>
              <label>
                Email tài khoản
                <input value={user.email} readOnly />
                <small>Email không công khai và không thể đổi tại đây.</small>
              </label>
            </div>
            <label>
              Giới thiệu công khai
              <textarea
                value={bio}
                maxLength={300}
                rows={3}
                placeholder="Chia sẻ đôi điều về bạn hoặc bộ phim yêu thích…"
                onChange={(event) => setBio(event.target.value)}
              />
              <small>{bio.length}/300 ký tự</small>
            </label>
          </section>
          <section className="account-form-section">
            <h3>
              <ImagePlus size={18} /> Ảnh đại diện
            </h3>
            <p>Chọn một hình có sẵn hoặc tải ảnh riêng của bạn.</p>
            <fieldset className="avatar-picker">
              <legend className="sr-only">Chọn ảnh đại diện</legend>
              {avatarOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={avatarId === option.id ? "selected" : ""}
                  disabled={saving || uploading}
                  onClick={() => setAvatarId(option.id)}
                  aria-label={option.label}
                  aria-pressed={avatarId === option.id}
                  title={option.label}
                >
                  <UserAvatar avatarId={option.id} name={name} />
                  <span>{option.label}</span>
                </button>
              ))}
              {hasUploadedAvatar(user.avatarVersion) && (
                <button
                  type="button"
                  disabled={saving || uploading}
                  className={avatarId === "upload" ? "selected" : ""}
                  aria-pressed={avatarId === "upload"}
                  onClick={() => setAvatarId("upload")}
                >
                  <UserAvatar
                    avatarId="upload"
                    avatarVersion={user.avatarVersion}
                    userId={user.id}
                    name={name}
                  />
                  <span>Ảnh của bạn</span>
                </button>
              )}
            </fieldset>
            {apiMode === "production" && (
              <label className="account-avatar-upload">
                Tải ảnh từ thiết bị
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploading || saving}
                  onChange={(event) => {
                    void uploadAvatar(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                <small>
                  {uploading
                    ? "Đang tải ảnh đại diện…"
                    : "JPEG, PNG hoặc WebP · tối đa 2 MB. Ảnh tải lên được lưu ngay."}
                </small>
              </label>
            )}
          </section>
          <section className="account-form-section">
            <h3>
              <Palette size={18} /> Viền trang trí
            </h3>
            <p>
              37 viền trong 5 bộ sưu tập. Mở nhóm để xem trước và chọn viền đã
              mở khóa.
            </p>
            <fieldset className="frame-picker">
              <legend className="sr-only">Bộ sưu tập viền ảnh đại diện</legend>
              {frameGroups.map((group) => (
                <details key={group}>
                  <summary>{group}</summary>
                  <div className="frame-picker-grid">
                    {avatarFrames
                      .filter((frame) => frame.group === group)
                      .map((frame) => {
                        const locked =
                          (user.role !== "admin" &&
                            (user.cultivationXp ?? 0) < frame.minXp &&
                            !user.frameGrants?.includes(frame.id)) ||
                          (apiMode === "production" &&
                            !user.publicId &&
                            frame.id !== "none");
                        return (
                          <button
                            key={frame.id}
                            type="button"
                            disabled={locked}
                            className={
                              avatarFrameId === frame.id ? "selected" : ""
                            }
                            aria-pressed={avatarFrameId === frame.id}
                            onClick={() => setAvatarFrameId(frame.id)}
                          >
                            <UserAvatar
                              avatarId={avatarId}
                              avatarVersion={user.avatarVersion}
                              userId={user.id}
                              name={name}
                              frameId={frame.id}
                              cultivationXp={Math.max(
                                frame.minXp,
                                user.cultivationXp ?? 0,
                              )}
                            />
                            <strong>{frame.name}</strong>
                            <small>
                              {apiMode === "production" &&
                              !user.publicId &&
                              frame.id !== "none"
                                ? "Chưa kích hoạt"
                                : locked
                                  ? `Khóa · cần ${frame.minXp} đạo hạnh`
                                  : "Đã mở khóa"}
                            </small>
                          </button>
                        );
                      })}
                  </div>
                </details>
              ))}
            </fieldset>
          </section>
          {error && (
            <p className="form-error" role="status">
              {error}
            </p>
          )}
          <div className="account-save-bar">
            <span role="status">
              {dirty
                ? "Bạn có thay đổi chưa lưu."
                : saved
                  ? "Hồ sơ đã được cập nhật."
                  : "Thông tin hồ sơ đã được đồng bộ."}
            </span>
            <div>
              <button
                type="button"
                className="account-reset"
                onClick={resetDraft}
                disabled={!dirty || saving || uploading}
              >
                Hủy thay đổi
              </button>
              <button
                type="submit"
                className="account-save"
                disabled={!dirty || saving || uploading}
              >
                <Save size={17} />
                {saving
                  ? "Đang lưu…"
                  : saved && !dirty
                    ? "Đã lưu"
                    : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
