"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  Compass,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Bell,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react";
import { BrandLogo as Logo } from "@/components/ui/brand-logo";
import { UserAvatar } from "@/components/ui/user-avatar";
import { socialGateway } from "@/lib/social-gateway";
import { notificationGateway, type NotificationInbox } from "@/lib/notification-gateway";
import { subscribeToInvalidation } from "@/lib/realtime-client";
import { apiMode } from "@/lib/config";
import type { SocialInbox } from "@/lib/social-types";
import { genres } from "@/lib/movies";
import type { Dispatch, SetStateAction } from "react";
import type {
  HeaderProps,
  MovieFormat,
  MovieSortOption,
  MovieStatusFilter,
} from "@/components/site/types";

type SiteHeaderProps = HeaderProps & {
  onSocialOpen: () => void;
  socialOpen?: boolean;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  mobile: () => void;
  mobileOpen?: boolean;
  format?: MovieFormat;
  setFormat?: Dispatch<SetStateAction<MovieFormat>>;
  statusFilter?: MovieStatusFilter;
  setStatusFilter?: Dispatch<SetStateAction<MovieStatusFilter>>;
  sort?: MovieSortOption;
  setSort?: Dispatch<SetStateAction<MovieSortOption>>;
  onlyFree?: boolean;
  setOnlyFree?: Dispatch<SetStateAction<boolean>>;
  genre?: string;
  setGenre?: Dispatch<SetStateAction<string>>;
};

export default function SiteHeader({
  user,
  query,
  setQuery,
  go,
  mobile,
  mobileOpen = false,
  logout,
  theme,
  toggleTheme,
  onSocialOpen,
  socialOpen = false,
  pathname = "/",
  format = "all",
  setFormat,
  statusFilter = "all",
  setStatusFilter,
  sort = "new",
  setSort,
  onlyFree = false,
  setOnlyFree,
  genre = "Tất cả",
  setGenre,
}: SiteHeaderProps) {
  const [genreOpen, setGenreOpen] = useState(false);
  const [socialInbox, setSocialInbox] = useState<SocialInbox | null>(null);
  const [notificationInbox, setNotificationInbox] = useState<NotificationInbox | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const genreDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id || apiMode !== "production") return;
    let active = true;
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      void socialGateway.inbox().then(
        (value) => {
          if (active) setSocialInbox(value);
        },
        () => undefined,
      );
    };
    refresh();
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("viufilm3d:social-updated", refresh);
    const fallback = window.setInterval(refresh, 45_000);

    const refreshNotifications = () => {
      if (document.visibilityState !== "visible") return;
      void notificationGateway.inbox().then(
        (value) => {
          if (active) setNotificationInbox(value);
        },
        () => undefined,
      );
    };
    refreshNotifications();
    window.addEventListener("viufilm3d:notifications-updated", refreshNotifications);
    const fallbackNotif = window.setInterval(refreshNotifications, 60_000);

    return () => {
      active = false;
      setSocialInbox(null);
      setNotificationInbox(null);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("viufilm3d:social-updated", refresh);
      window.removeEventListener("viufilm3d:notifications-updated", refreshNotifications);
      window.clearInterval(fallback);
      window.clearInterval(fallbackNotif);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!socialInbox?.realtimeTopic || apiMode !== "production") return;
    return subscribeToInvalidation(socialInbox.realtimeTopic, () => {
      window.dispatchEvent(new Event("viufilm3d:social-updated"));
    });
  }, [socialInbox?.realtimeTopic]);

  useEffect(() => {
    if (!notificationInbox?.realtimeTopic || apiMode !== "production") return;
    return subscribeToInvalidation(notificationInbox.realtimeTopic, () => {
      window.dispatchEvent(new Event("viufilm3d:notifications-updated"));
    });
  }, [notificationInbox?.realtimeTopic]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        genreDropdownRef.current &&
        !genreDropdownRef.current.contains(event.target as Node)
      ) {
        setGenreOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetFilters = () => {
    setFormat?.("all");
    setStatusFilter?.("all");
    setGenre?.("Tất cả");
    setOnlyFree?.(false);
    setSort?.("new");
    setQuery("");
  };

  return (
    <>
      <header className="ha-header">
        <div className="ha-container ha-header-inner">
        <button
          type="button"
          className="mobile-menu"
          onClick={mobile}
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <button
          className="ha-logo-btn"
          onClick={() => {
            resetFilters();
            go("/");
          }}
          aria-label="Trang chủ ViuFilm3D"
        >
          <Logo />
        </button>
        <div className="ha-search">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && go("/phim")}
            placeholder="Tìm kiếm phim…"
          />
          <button onClick={() => go("/phim")} aria-label="Tìm phim">
            <Search size={16} />
          </button>
        </div>
        <div className="ha-actions">
          <button
            type="button"
            className="ha-theme-toggle"
            onClick={toggleTheme}
            title={
              theme === "dark"
                ? "Chuyển sang chế độ sáng"
                : "Chuyển sang chế độ tối"
            }
            aria-label={
              theme === "dark"
                ? "Chuyển sang chế độ sáng"
                : "Chuyển sang chế độ tối"
            }
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <>
              <button
                className="social-trigger"
                onClick={onSocialOpen}
                title="Bằng hữu và mật thư"
                aria-label="Mở bằng hữu và mật thư"
              >
                <MessageCircle />
                {socialInbox &&
                  socialInbox.unreadCount + socialInbox.incoming.length > 0 && (
                    <span className="social-trigger-badge">
                      {Math.min(
                        99,
                        socialInbox.unreadCount + socialInbox.incoming.length,
                      )}
                    </span>
                  )}
              </button>
              <div className="notification-wrapper" ref={notificationDropdownRef}>
                <button
                  className="social-trigger"
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  title="Thông báo"
                  aria-label="Mở thông báo"
                >
                  <Bell />
                  {notificationInbox && notificationInbox.unreadCount > 0 && (
                    <span className="social-trigger-badge">
                      {Math.min(99, notificationInbox.unreadCount)}
                    </span>
                  )}
                </button>
                {notificationOpen && notificationInbox && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h3>Thông báo</h3>
                      {notificationInbox.unreadCount > 0 && (
                        <button
                          onClick={() => {
                            void notificationGateway.markAsRead();
                            setNotificationInbox({ ...notificationInbox, unreadCount: 0, items: notificationInbox.items.map((i) => ({ ...i, is_read: true })) });
                          }}
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>
                    <div className="notification-list">
                      {notificationInbox.items.length === 0 ? (
                        <div className="notification-empty">Không có thông báo nào</div>
                      ) : (
                        notificationInbox.items.map((item) => (
                          <div
                            key={item.id}
                            className={`notification-item ${!item.is_read ? "unread" : ""}`}
                            onClick={() => {
                              if (!item.is_read) {
                                void notificationGateway.markAsRead(item.id);
                                setNotificationInbox({
                                  ...notificationInbox,
                                  unreadCount: Math.max(0, notificationInbox.unreadCount - 1),
                                  items: notificationInbox.items.map((i) => i.id === item.id ? { ...i, is_read: true } : i)
                                });
                              }
                              if (item.link) {
                                setNotificationOpen(false);
                                go(item.link);
                              }
                            }}
                          >
                            <p>{item.content}</p>
                            <span className="notification-time">{new Date(item.created_at).toLocaleDateString("vi-VN")}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {user.role === "admin" && (
                <button
                  onClick={() => go("/admin")}
                  title="Trang quản trị"
                  aria-label="Trang quản trị"
                >
                  <Settings />
                </button>
              )}
              <button className="user-link" onClick={() => go("/tai-khoan")}>
                <UserAvatar
                  frameId={user.avatarFrameId}
                  cultivationXp={user.cultivationXp}
                  avatarId={user.avatarId}
                  avatarVersion={user.avatarVersion}
                  userId={user.id}
                  name={user.name}
                  size="small"
                />
                <span>{user.name.split(" ")[0]}</span>
              </button>
              <button onClick={logout} title="Đăng xuất">
                <LogOut />
              </button>
            </>
          ) : (
            <button className="user-link" onClick={() => go("/dang-nhap")}>
              <User />
              <span>Đăng nhập</span>
            </button>
          )}
        </div>
      </div>
      <nav className="ha-nav">
        <div className="ha-container ha-nav-inner">
          <button
            className={pathname === "/" ? "active" : ""}
            onClick={() => {
              resetFilters();
              go("/");
            }}
          >
            Phim mới
          </button>
          <button
            className={pathname === "/lich-chieu" ? "active" : ""}
            onClick={() => {
              resetFilters();
              go("/lich-chieu");
            }}
          >
            Lịch chiếu
          </button>
          <div
            className="genre-dropdown-wrap"
            ref={genreDropdownRef}
            onMouseEnter={() => setGenreOpen(true)}
            onMouseLeave={() => setGenreOpen(false)}
          >
            <button
              type="button"
              className={`genre-dropdown-trigger ${
                genreOpen ||
                (pathname === "/phim" &&
                  (genre !== "Tất cả" ||
                    (format === "all" &&
                      statusFilter === "all" &&
                      !onlyFree &&
                      sort === "new")))
                  ? "active"
                  : ""
              }`}
              onClick={() => setGenreOpen((prev) => !prev)}
              aria-expanded={genreOpen}
            >
              <span>Thể loại {genre !== "Tất cả" ? `(${genre})` : ""}</span>
              <ChevronDown
                size={13}
                className={`genre-chevron ${genreOpen ? "open" : ""}`}
              />
            </button>

            {genreOpen && (
              <div className="genre-dropdown-menu">
                <div className="genre-dropdown-grid">
                  {genres.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`genre-menu-item ${genre === item ? "active" : ""}`}
                      onClick={() => {
                        setGenre?.(item);
                        setFormat?.("all");
                        setStatusFilter?.("all");
                        setOnlyFree?.(false);
                        setGenreOpen(false);
                        go("/phim");
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            className={pathname === "/phim" && sort === "views" ? "active" : ""}
            onClick={() => {
              setSort?.("views");
              go("/phim");
            }}
          >
            Đang hot
          </button>
          <button
            className={
              pathname === "/phim" && format === "series" ? "active" : ""
            }
            onClick={() => {
              setFormat?.("series");
              go("/phim");
            }}
          >
            Phim bộ
          </button>
          <button
            className={
              pathname === "/phim" && format === "single" ? "active" : ""
            }
            onClick={() => {
              setFormat?.("single");
              go("/phim");
            }}
          >
            Phim lẻ
          </button>
          <button
            className={
              pathname === "/phim" && statusFilter === "Hoàn thành"
                ? "active"
                : ""
            }
            onClick={() => {
              setStatusFilter?.("Hoàn thành");
              go("/phim");
            }}
          >
            Hoàn thành
          </button>
          <button
            className={pathname === "/phim" && onlyFree ? "active" : ""}
            onClick={() => {
              setOnlyFree?.(!onlyFree);
              go("/phim");
            }}
          >
            Miễn phí
          </button>
          <button
            className={pathname === "/lich-su" ? "active" : ""}
            onClick={() => go("/lich-su")}
          >
            Lịch sử
          </button>
        </div>
      </nav>
      </header>
      <nav className="mobile-bottom-nav">
        <button
          className={pathname === "/" && !socialOpen ? "active" : ""}
          onClick={() => {
            resetFilters();
            go("/");
          }}
        >
          <Home size={22} />
          <span>Trang chủ</span>
        </button>
        <button
          className={pathname === "/phim" && !socialOpen ? "active" : ""}
          onClick={() => go("/phim")}
        >
          <Compass size={22} />
          <span>Khám phá</span>
        </button>
        <button className={socialOpen ? "active" : ""} onClick={onSocialOpen}>
          <div className="social-trigger-icon">
            <MessageCircle size={22} />
            {socialInbox &&
              socialInbox.unreadCount + socialInbox.incoming.length > 0 && (
                <span className="social-trigger-badge">
                  {Math.min(
                    99,
                    socialInbox.unreadCount + socialInbox.incoming.length,
                  )}
                </span>
              )}
          </div>
          <span>Bằng hữu</span>
        </button>
        <button
          className={pathname === "/tai-khoan" && !socialOpen ? "active" : ""}
          onClick={() => go(user ? "/tai-khoan" : "/dang-nhap")}
        >
          <User size={22} />
          <span>{user ? "Cá nhân" : "Đăng nhập"}</span>
        </button>
      </nav>
    </>
  );
}

export function MobileNav({
  user,
  go,
  close,
  logout,
  theme,
  toggleTheme,
  onSocialOpen: _onSocialOpen,
  pathname = "/",
  format = "all",
  setFormat,
  statusFilter: _statusFilter = "all",
  setStatusFilter,
  sort: _sort = "new",
  setSort,
  onlyFree: _onlyFree = false,
  setOnlyFree,
  genre = "Tất cả",
  setGenre,
}: HeaderProps & {
  close: () => void;
  onSocialOpen: () => void;
  format?: MovieFormat;
  setFormat?: Dispatch<SetStateAction<MovieFormat>>;
  statusFilter?: MovieStatusFilter;
  setStatusFilter?: Dispatch<SetStateAction<MovieStatusFilter>>;
  sort?: MovieSortOption;
  setSort?: Dispatch<SetStateAction<MovieSortOption>>;
  onlyFree?: boolean;
  setOnlyFree?: Dispatch<SetStateAction<boolean>>;
  genre?: string;
  setGenre?: Dispatch<SetStateAction<string>>;
}) {
  const [mobileGenresOpen, setMobileGenresOpen] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [close]);

  const resetFilters = () => {
    setFormat?.("all");
    setStatusFilter?.("all");
    setGenre?.("Tất cả");
    setOnlyFree?.(false);
    setSort?.("new");
  };

  return createPortal(
    <div
      id="mobile-navigation"
      className="mobile-layer"
      role="dialog"
      aria-modal="true"
      aria-label="Menu điều hướng"
    >
      <button
        type="button"
        className="mobile-backdrop"
        onClick={close}
        aria-label="Đóng menu"
      />
      <aside>
        <button
          type="button"
          className="mobile-close"
          onClick={close}
          aria-label="Đóng menu"
        >
          <X />
        </button>
        <Logo />
        <strong>Danh mục</strong>
        <button
          className={pathname === "/" ? "active" : ""}
          onClick={() => {
            resetFilters();
            go("/");
          }}
        >
          Phim mới
        </button>
        <button
          className={pathname === "/lich-chieu" ? "active" : ""}
          onClick={() => {
            resetFilters();
            go("/lich-chieu");
          }}
        >
          Lịch chiếu
        </button>
        <div className="mobile-genre-group">
          <button
            type="button"
            className={`mobile-genre-toggle ${genre !== "Tất cả" ? "active" : ""}`}
            onClick={() => setMobileGenresOpen(!mobileGenresOpen)}
          >
            <span>Thể loại {genre !== "Tất cả" ? `(${genre})` : ""}</span>
            <ChevronDown size={14} className={mobileGenresOpen ? "open" : ""} />
          </button>
          {mobileGenresOpen && (
            <div className="mobile-genre-subitems">
              {genres.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`mobile-genre-subitem ${genre === item ? "active" : ""}`}
                  onClick={() => {
                    setGenre?.(item);
                    setFormat?.("all");
                    setStatusFilter?.("all");
                    setOnlyFree?.(false);
                    close();
                    go("/phim");
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          className={
            pathname === "/phim" && format === "series" ? "active" : ""
          }
          onClick={() => {
            setFormat?.("series");
            go("/phim");
          }}
        >
          Phim bộ
        </button>
        <button
          className={
            pathname === "/phim" && format === "single" ? "active" : ""
          }
          onClick={() => {
            setFormat?.("single");
            go("/phim");
          }}
        >
          Phim lẻ (Bản Full)
        </button>
        <button
          className={pathname === "/lich-su" ? "active" : ""}
          onClick={() => go("/lich-su")}
        >
          Lịch sử xem
        </button>
        {toggleTheme && (
          <div className="mobile-theme-row">
            <span>Giao diện</span>
            <button
              type="button"
              className="mobile-theme-toggle"
              onClick={toggleTheme}
              aria-label="Đổi giao diện sáng/tối"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              <span>{theme === "dark" ? "Chế độ Sáng" : "Chế độ Tối"}</span>
            </button>
          </div>
        )}
        {user ? (
          <>
            <button onClick={() => go("/tai-khoan")}>Tài khoản</button>
            {user.role === "admin" && (
              <button onClick={() => go("/admin")}>Quản trị</button>
            )}
            <button
              onClick={() => {
                logout();
                close();
              }}
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <button onClick={() => go("/dang-nhap")}>Đăng nhập</button>
        )}
      </aside>
    </div>,
    document.body,
  );
}
