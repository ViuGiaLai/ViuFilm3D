"use client";

import { useEffect, useState } from "react";
import {
  CalendarClock,
  Check,
  CircleAlert,
  Clapperboard,
  Eye,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Plus,
  Settings,
  UserPlus,
  Users,
  Sparkles,
  Globe2,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { BrandLogo as Logo } from "@/components/ui/brand-logo";
import { adminGateway } from "@/lib/admin-gateway";
import { viewerSeed, type SiteSettings, type Viewer } from "@/lib/admin-data";
import { toSlug } from "@/lib/format";
import { movieGateway } from "@/lib/movie-gateway";
import { apiMode } from "@/lib/config";
import type { Movie } from "@/lib/movies";
import AdminDashboard from "@/components/admin/admin-dashboard";
import AdminMovies from "@/components/admin/admin-movies";
import AdminSchedule from "@/components/admin/admin-schedule";
import AdminSettings from "@/components/admin/admin-settings";
import AdminUsers from "@/components/admin/admin-users";
import AdminComments from "@/components/admin/admin-comments";
import MovieForm from "@/components/admin/movie-form";
import ViewerForm from "@/components/admin/viewer-form";
import AdminCommunity from "@/components/admin/admin-community";
import SupportProfileForm from "@/components/admin/support-profile-form";
import type { AdminPanelProps } from "@/components/admin/types";

type AdminNotice = {
  message: string;
  tone: "success" | "error";
};

export default function AdminPanel({
  account,
  movies,
  setMovies,
  logout,
  pathname,
  go,
  settings,
  setSettings,
}: AdminPanelProps) {
  const section = pathname.includes("/admin/vien-trang-tri")
    ? "frames"
    : pathname.includes("/admin/the-gioi")
      ? "world"
      : pathname.includes("/admin/nhat-ky")
        ? "audit"
        : pathname.includes("/admin/phim")
          ? "movies"
          : pathname.includes("/admin/lich-chieu")
            ? "schedule"
            : pathname.includes("/admin/binh-luan")
              ? "comments"
              : pathname.includes("/admin/nguoi-dung")
                ? "users"
                : pathname.includes("/admin/cai-dat")
                  ? "settings"
                  : "dashboard";
  const [editing, setEditing] = useState<Movie | null | undefined>(undefined);
  const [editingViewer, setEditingViewer] = useState<Viewer | null | undefined>(
    undefined,
  );
  const [viewers, setViewers] = useState<Viewer[]>(
    apiMode === "mock" ? viewerSeed : [],
  );
  const [notice, setNotice] = useState<AdminNotice | null>(null);
  const [supporting, setSupporting] = useState<Viewer | null>(null);
  const identity = viewers.find(
    (viewer) =>
      viewer.role === "admin" &&
      (account.id ? viewer.id === account.id : viewer.email === account.email),
  );
  const navigation = [
    {
      key: "dashboard",
      url: "/admin",
      label: "Tổng quan",
      icon: LayoutDashboard,
      group: "ĐIỀU HÀNH",
    },
    {
      key: "movies",
      url: "/admin/phim",
      label: "Kho phim",
      icon: Clapperboard,
    },
    {
      key: "schedule",
      url: "/admin/lich-chieu",
      label: "Lịch chiếu",
      icon: CalendarClock,
    },
    {
      key: "users",
      url: "/admin/nguoi-dung",
      label: "Người dùng",
      icon: Users,
      group: "CỘNG ĐỒNG",
    },
    {
      key: "comments",
      url: "/admin/binh-luan",
      label: "Bình luận",
      icon: MessageCircle,
    },
    {
      key: "frames",
      url: "/admin/vien-trang-tri",
      label: "Viền & cảnh giới",
      icon: Sparkles,
    },
    { key: "world", url: "/admin/the-gioi", label: "Thế Giới", icon: Globe2 },
    {
      key: "audit",
      url: "/admin/nhat-ky",
      label: "Nhật ký hỗ trợ",
      icon: ScrollText,
    },
    {
      key: "settings",
      url: "/admin/cai-dat",
      label: "Cài đặt",
      icon: Settings,
      group: "HỆ THỐNG",
    },
  ];

  useEffect(() => {
    let active = true;
    void adminGateway
      .listViewers()
      .then((items) => {
        if (active) setViewers(items);
      })
      .catch((error) => {
        if (!active) return;
        setNotice({
          message:
            error instanceof Error
              ? error.message
              : "Không thể tải danh sách người dùng",
          tone: "error",
        });
      });
    return () => {
      active = false;
    };
  }, []);

  const notify = (message: string, tone: AdminNotice["tone"] = "success") => {
    setNotice({ message, tone });
    window.setTimeout(() => setNotice(null), 3500);
  };
  const notifyError = (error: unknown) => {
    notify(
      error instanceof Error ? error.message : "Thao tác không thành công",
      "error",
    );
  };
  const save = async (movie: Movie) => {
    const normalized = {
      ...movie,
      slug: movie.slug || toSlug(movie.title),
      episode: Math.min(movie.episode, movie.totalEpisodes),
    };
    try {
      const saved = await movieGateway.save(normalized);
      setMovies((current: Movie[]) => {
        const exists = current.some((item) => item.id === saved.id);
        const next = exists
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...current];
        return [...next].sort((a, b) => b.id - a.id);
      });
      setEditing(undefined);
      notify(movie.title ? `Đã lưu “${movie.title}”` : "Đã lưu phim");
    } catch (error) {
      notifyError(error);
    }
  };
  const remove = async (id: number) => {
    if (!confirm("Xóa phim này khỏi thư viện?")) return;
    try {
      await movieGateway.remove(id);
      setMovies((current: Movie[]) => current.filter((item) => item.id !== id));
      notify("Đã xóa phim khỏi thư viện");
    } catch (error) {
      notifyError(error);
    }
  };
  const removeMany = async (ids: number[]) => {
    if (!ids.length || !confirm(`Xóa ${ids.length} phim đã chọn?`)) return;
    try {
      await movieGateway.removeMany(ids);
      setMovies((current: Movie[]) =>
        current.filter((item) => !ids.includes(item.id)),
      );
      notify(`Đã xóa ${ids.length} phim`);
    } catch (error) {
      notifyError(error);
    }
  };
  const duplicateMovie = async (movie: Movie) => {
    const duplicate = {
      ...movie,
      id: Date.now(),
      title: `${movie.title} — Bản sao`,
      slug: `${movie.slug}-ban-sao-${Date.now()}`,
      featured: false,
      views: 0,
    };
    try {
      const saved = await movieGateway.save(duplicate);
      setMovies((current: Movie[]) =>
        [saved, ...current].sort((a, b) => b.id - a.id),
      );
      notify("Đã nhân bản phim");
    } catch (error) {
      notifyError(error);
    }
  };
  const patchMovie = async (id: number, changes: Partial<Movie>) => {
    const current = movies.find((movie: Movie) => movie.id === id);
    if (!current) return;
    try {
      const saved = await movieGateway.save({ ...current, ...changes });
      setMovies((items: Movie[]) =>
        items
          .map((movie) => (movie.id === id ? saved : movie))
          .sort((a, b) => b.id - a.id),
      );
      notify("Đã cập nhật phim");
    } catch (error) {
      notifyError(error);
    }
  };
  const saveViewer = async (viewer: Viewer) => {
    const normalized = viewer;
    const duplicateEmail = viewers.some(
      (item) => item.email === normalized.email && item.id !== normalized.id,
    );
    if (duplicateEmail) {
      notify("Email đã tồn tại trong hệ thống");
      return;
    }
    try {
      const saved = await adminGateway.saveViewer(normalized);
      setViewers((current) =>
        current.some((item) => item.id === saved.id)
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...current],
      );
      setEditingViewer(undefined);
      notify("Đã lưu tài khoản");
    } catch (error) {
      notifyError(error);
    }
  };
  const patchViewer = async (id: number, changes: Partial<Viewer>) => {
    const current = viewers.find((viewer) => viewer.id === id);
    if (!current) return;
    try {
      const saved = await adminGateway.saveViewer({ ...current, ...changes });
      setViewers((items) =>
        items.map((viewer) => (viewer.id === id ? saved : viewer)),
      );
      notify("Đã cập nhật tài khoản");
    } catch (error) {
      notifyError(error);
    }
  };
  const removeViewer = async (id: number) => {
    const target = viewers.find((viewer) => viewer.id === id);
    if (!target || target.role === "admin") {
      notify("Không thể xóa tài khoản quản trị chính");
      return;
    }
    if (
      !confirm(
        `Xóa vĩnh viễn tài khoản ${target.email} cùng dữ liệu liên quan? Nên khóa tài khoản nếu chỉ muốn ngăn truy cập.`,
      )
    )
      return;
    try {
      await adminGateway.removeViewer(id);
      setViewers((items) => items.filter((viewer) => viewer.id !== id));
      notify("Đã xóa tài khoản");
    } catch (error) {
      notifyError(error);
    }
  };
  const saveSettings = async (next: SiteSettings) => {
    try {
      const saved = await adminGateway.saveSettings(next);
      setSettings(saved);
      notify("Đã lưu cấu hình hệ thống");
    } catch (error) {
      notifyError(error);
    }
  };
  const sectionTitle: Record<string, string> = {
    dashboard: "Tổng quan hệ thống",
    movies: "Quản lý kho phim",
    schedule: "Lịch phát hành",
    users: "Quản lý người dùng",
    comments: "Quản lý bình luận",
    settings: "Cấu hình hệ thống",
    frames: "Viền trang trí & tiên lộ",
    world: "Thế Giới — Luận Đạo",
    audit: "Nhật ký hỗ trợ cộng đồng",
  };
  return (
    <div className="admin-layout">
      {notice && (
        <div
          className={`admin-notice ${notice.tone}`}
          role={notice.tone === "error" ? "alert" : "status"}
        >
          {notice.tone === "error" ? <CircleAlert /> : <Check />}
          {notice.message}
        </div>
      )}
      <aside>
        <Logo />
        {navigation.map(({ key, url, label, icon: Icon, group }) => (
          <div className="admin-nav-entry" key={key}>
            {group && <p className="admin-nav-group">{group}</p>}
            <button
              type="button"
              className={`admin-nav-btn ${section === key ? "active" : ""}`}
              aria-current={section === key ? "page" : undefined}
              onClick={() => go(url)}
            >
              <span className="admin-nav-icon">
                <Icon aria-hidden="true" />
              </span>
              <span>{label}</span>
              {section === key && (
                <i className="admin-nav-dot" aria-hidden="true" />
              )}
            </button>
          </div>
        ))}
        <button
          className="admin-nav-btn admin-site-link"
          onClick={() => go("/")}
        >
          <span className="admin-nav-icon">
            <Eye aria-hidden="true" />
          </span>
          <span>Xem website</span>
        </button>
        <button className="admin-logout" onClick={logout}>
          <LogOut /> Đăng xuất
        </button>
      </aside>
      <main>
        <header>
          <div>
            <p className="mini-label">VIUFILM3D STUDIO</p>
            <h1>{sectionTitle[section]}</h1>
          </div>
          <div className="admin-profile">
            <span className="api-mode-badge">{apiMode}</span>
            <button
              type="button"
              className="admin-account-link"
              onClick={() => go("/tai-khoan")}
              aria-label="Mở hồ sơ quản trị của bạn"
            >
              <span className="admin-account-copy">
                <strong>{identity?.name ?? account.name}</strong>
                <small>
                  <ShieldCheck size={12} aria-hidden="true" />
                  Quản trị viên
                </small>
              </span>
              <UserAvatar
                name={identity?.name ?? account.name}
                userId={identity?.id ?? account.id}
                avatarId={identity?.avatarId ?? account.avatarId}
                avatarVersion={
                  identity ? identity.avatarVersion : account.avatarVersion
                }
                frameId={identity?.avatarFrameId ?? account.avatarFrameId}
                cultivationXp={identity?.cultivationXp ?? account.cultivationXp}
              />
            </button>
          </div>
        </header>
        {section === "dashboard" && (
          <AdminDashboard movies={movies} viewers={viewers} go={go} />
        )}
        {section === "movies" && (
          <AdminMovies
            movies={movies}
            edit={setEditing}
            remove={remove}
            removeMany={removeMany}
            duplicate={duplicateMovie}
            patchMovie={patchMovie}
            pageSize={settings.itemsPerPage}
          />
        )}
        {section === "schedule" && (
          <AdminSchedule movies={movies} edit={setEditing} patch={patchMovie} />
        )}
        {section === "users" && (
          <AdminUsers
            viewers={viewers}
            edit={setEditingViewer}
            patch={patchViewer}
            remove={removeViewer}
          />
        )}
        {section === "comments" && <AdminComments />}
        {(section === "frames" ||
          section === "world" ||
          section === "audit") && (
          <AdminCommunity
            section={section}
            viewers={viewers}
            support={setSupporting}
          />
        )}
        {section === "settings" && (
          <AdminSettings settings={settings} save={saveSettings} />
        )}
      </main>
      {editing !== undefined && (
        <MovieForm
          movie={editing}
          close={() => setEditing(undefined)}
          save={save}
        />
      )}{" "}
      {editingViewer !== undefined && (
        <ViewerForm
          viewer={editingViewer}
          close={() => setEditingViewer(undefined)}
          save={saveViewer}
          support={(viewer) => {
            setEditingViewer(undefined);
            setSupporting(viewer);
          }}
        />
      )}
      {supporting && (
        <SupportProfileForm
          viewer={supporting}
          close={() => setSupporting(null)}
          saved={async () => {
            setViewers(await adminGateway.listViewers());
            notify("Đã hỗ trợ hồ sơ và ghi nhật ký");
          }}
        />
      )}
      {section === "movies" && (
        <button className="admin-fab" onClick={() => setEditing(null)}>
          <Plus /> Thêm phim
        </button>
      )}
      {section === "users" && apiMode === "mock" && (
        <button className="admin-fab" onClick={() => setEditingViewer(null)}>
          <UserPlus /> Thêm người dùng
        </button>
      )}
    </div>
  );
}
