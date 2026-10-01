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
  Eye,
  EyeOff,
  Mail,
  Lock,
  Film,
  Users,
  ArrowRight,
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
  allowRegistration = true,
}: LoginPageProps) {
  const isProduction = apiMode === "production";
  const [registering, setRegistering] = useState(false);
  const [needResendConfirm, setNeedResendConfirm] = useState(false);
  const [name, setName] = useState("");
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState(isProduction ? "" : "user@gmail.com");
  const [password, setPassword] = useState(isProduction ? "" : "123456");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("viufilm_remember_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  const handleSaveRemember = (userEmail: string) => {
    try {
      if (rememberMe) {
        localStorage.setItem("viufilm_remember_email", userEmail);
      } else {
        localStorage.removeItem("viufilm_remember_email");
      }
    } catch {
      // ignore
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (registering) {
      if (name.trim().length < 2) {
        setError("Tên hiển thị phải có ít nhất 2 ký tự.");
        return;
      }
      const minLen = isProduction ? 8 : 6;
      if (password.length < minLen) {
        setError(`Mật khẩu phải có ít nhất ${minLen} ký tự.`);
        return;
      }
      if (password !== confirmPassword) {
        setError("Mật khẩu xác nhận không khớp.");
        return;
      }
    }

    setSubmitting(true);
    const targetEmail = email.trim().toLowerCase();

    if (apiMode === "production") {
      try {
        if (registering) {
          const result = await authGateway.register(
            name.trim(),
            targetEmail,
            password,
          );
          if (result.userAlreadyExists) {
            setNotice(
              "Tài khoản đã tồn tại. Nếu bạn chưa xác nhận email, hãy bấm nút gửi lại bên dưới.",
            );
            setNeedResendConfirm(true);
            setRegistering(false);
            return;
          }
          if (result.confirmationRequired) {
            setNotice(
              "Tài khoản đã được gửi yêu cầu đăng ký. Hãy kiểm tra hộp thư xác nhận để hoàn tất kích hoạt.",
            );
            setRegistering(false);
          } else {
            const account = await authGateway.login(targetEmail, password);
            if (account) {
              handleSaveRemember(targetEmail);
              onLogin(account);
            }
          }
          return;
        }

        const account = await authGateway.login(targetEmail, password);
        if (account) {
          handleSaveRemember(targetEmail);
          onLogin(account);
        }
      } catch (submitError) {
        setError(
          submitError instanceof ApiRequestError && submitError.status === 401
            ? submitError.message
            : registering
              ? "Không thể đăng ký lúc này. Vui lòng kiểm tra lại thông tin."
              : "Email hoặc mật khẩu không chính xác.",
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Mock mode
    if (registering) {
      const newAccount: Account = {
        email: targetEmail,
        name: name.trim() || targetEmail.split("@")[0],
        role: "user",
      };
      handleSaveRemember(targetEmail);
      onLogin(newAccount);
      setSubmitting(false);
      return;
    }

    const viewers = await adminGateway.listViewers();
    const viewer = viewers.find(
      (item) => item.email === targetEmail,
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
    handleSaveRemember(targetEmail);
    onLogin({ email: viewer.email, name: viewer.name, role: viewer.role });
    setSubmitting(false);
  };

  const resendConfirmation = async () => {
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      await authGateway.resendConfirmation(email.trim().toLowerCase());
      setNotice("Email xác nhận đã được gửi lại thành công. Vui lòng kiểm tra hộp thư của bạn.");
      setNeedResendConfirm(false);
    } catch (submitError) {
      setError(
        submitError instanceof ApiRequestError
          ? submitError.message
          : "Không thể gửi lại email xác nhận lúc này.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-art">
        <div className="login-art-header">
          <Logo />
          <span className="login-art-badge">
            <Sparkles size={13} />
            Đỉnh Cao Anime 3D
          </span>
        </div>

        <div className="login-art-center">
          <div className="login-art-features">
            <div className="login-feature-card">
              <div className="login-feature-icon">
                <Film size={20} />
              </div>
              <div className="login-feature-content">
                <h4>Độ phân giải 4K Ultra HD</h4>
                <p>Khung hình mượt mà, âm thanh vòm sống động chuẩn rạp chiếu.</p>
              </div>
            </div>

            <div className="login-feature-card">
              <div className="login-feature-icon">
                <Users size={20} />
              </div>
              <div className="login-feature-content">
                <h4>Phòng Xem Chung Realtime</h4>
                <p>Đồng bộ từng mili-giây, voice chat và bình luận tức thì cùng đạo hữu.</p>
              </div>
            </div>

            <div className="login-feature-card">
              <div className="login-feature-icon">
                <Sparkles size={20} />
              </div>
              <div className="login-feature-content">
                <h4>Tu Vi & Linh Thạch</h4>
                <p>Xem phim tích lũy chân khí, đột phá cảnh giới và mở khóa ấn ký độc quyền.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-art-footer">
          <p className="mini-label">THẾ GIỚI HOẠT HÌNH 3D</p>
          <h1>
            Mỗi khung hình,
            <br />
            <em>một thế giới mới.</em>
          </h1>
          <span>
            Thư viện phim hoạt hình 3D nguyên bản, cập nhật nhanh nhất cho cộng đồng tu tiên.
          </span>
        </div>
      </section>

      <div className="login-form-container">
        <button
          type="button"
          className="login-close"
          onClick={close}
          title="Đóng (Phím Esc)"
          aria-label="Đóng màn hình đăng nhập"
        >
          <X size={18} />
        </button>

        <form onSubmit={submit} className="login-page-form">
          <div className="login-form-header">
            <p className="mini-label">TÀI KHOẢN VIUFILM3D</p>
            <h2>{registering ? "Tạo tài khoản mới" : "Chào mừng trở lại"}</h2>
            <p className="login-form-desc">
              {registering
                ? "Đăng ký để bình luận, lưu phim yêu thích, tích lũy tu vi và xem trên mọi thiết bị."
                : "Đăng nhập để quản lý phim yêu thích, tiếp tục xem và vào phòng xem chung."}
            </p>
          </div>

          {allowRegistration && (
            <div className="auth-segmented-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={!registering}
                className={`auth-tab ${!registering ? "active" : ""}`}
                onClick={() => {
                  setRegistering(false);
                  setError("");
                  setNotice("");
                  setNeedResendConfirm(false);
                }}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={registering}
                className={`auth-tab ${registering ? "active" : ""}`}
                onClick={() => {
                  setRegistering(true);
                  setError("");
                  setNotice("");
                  setNeedResendConfirm(false);
                }}
              >
                Đăng ký
              </button>
            </div>
          )}

          <div className="auth-fields-stack">
            {registering && (
              <label className="auth-input-label">
                <span className="auth-label-text">Tên hiển thị</span>
                <div className="auth-input-wrapper">
                  <UserRound className="auth-input-icon" size={17} />
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    placeholder="Ví dụ: Tiêu Viêm, Hàn Lập..."
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
              </label>
            )}

            <label className="auth-input-label">
              <span className="auth-label-text">Email</span>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" size={17} />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                    setNeedResendConfirm(false);
                  }}
                />
              </div>
            </label>

            <label className="auth-input-label">
              <span className="auth-label-text">Mật khẩu</span>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={registering ? (isProduction ? 8 : 6) : undefined}
                  autoComplete={registering ? "new-password" : "current-password"}
                  placeholder={registering ? (isProduction ? "Tối thiểu 8 ký tự" : "Tối thiểu 6 ký tự") : "••••••••"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {registering && (
              <label className="auth-input-label">
                <span className="auth-label-text">Xác nhận mật khẩu</span>
                <div className="auth-input-wrapper">
                  <ShieldCheck className="auth-input-icon" size={17} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={isProduction ? 8 : 6}
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu vừa đặt"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setError("");
                    }}
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
            )}

            {!registering && (
              <div className="auth-extra-row">
                <label className="auth-remember-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Ghi nhớ tài khoản</span>
                </label>
              </div>
            )}
          </div>

          {error && (
            <div className="form-error auth-alert" role="alert">
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div className="form-notice auth-alert" role="status">
              <span>{notice}</span>
            </div>
          )}

          <button
            type="submit"
            className="primary-btn auth-submit-btn"
            disabled={submitting || needResendConfirm}
          >
            {submitting ? (
              <span className="auth-btn-loading">
                <span className="auth-spinner" />
                Đang xử lý...
              </span>
            ) : registering ? (
              <span className="auth-btn-content">
                Tạo tài khoản mới
                <ArrowRight size={17} />
              </span>
            ) : (
              <span className="auth-btn-content">
                Đăng nhập
                <ArrowRight size={17} />
              </span>
            )}
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

          {!isProduction && (
            <div className="demo-accounts-box">
              <div className="demo-accounts-header">
                <Sparkles size={13} />
                <span>Tài khoản dùng thử (Mock mode):</span>
              </div>
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
                  <span className="demo-badge user">👤 Người xem</span>
                  <span className="demo-email">user@gmail.com</span>
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
                  <span className="demo-badge admin">🛡️ Quản trị viên</span>
                  <span className="demo-email">admin@gmail.com</span>
                </button>
              </div>
              <small className="demo-tip">Mật khẩu mặc định: <strong>123456</strong></small>
            </div>
          )}
        </form>
      </div>
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
