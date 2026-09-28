"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Settings } from "lucide-react";
import { movieSeed, type Movie } from "@/lib/movies";
import { movieGateway } from "@/lib/movie-gateway";
import { apiMode } from "@/lib/config";
import { authGateway } from "@/lib/auth-gateway";
import { viewerGateway } from "@/lib/viewer-gateway";
import AdminPanel from "@/components/admin/admin-panel";
import LoginPage, { ProfilePage } from "@/components/site/account-pages";
import CatalogPage from "@/components/site/catalog-page";
import HomePage from "@/components/site/home-page";
import LibraryPage, {
  HistoryPage,
  NotFoundPage,
} from "@/components/site/library-pages";
import MovieDetail from "@/components/site/movie-detail";
import SiteFooter from "@/components/site/site-footer";
import SiteHeader, { MobileNav } from "@/components/site/site-header";
import WatchPage from "@/components/site/watch-page";
import PublicProfilePage from "@/components/site/public-profile";
import SocialPanel from "@/components/site/social-panel";
import { BrandLogo as Logo } from "@/components/ui/brand-logo";
import { CultivationSeal } from "@/components/ui/cultivation-seal";
import type { Account, HistoryItem, ThemeMode } from "@/lib/app-types";
import type {
  MovieFormat,
  MovieSortOption,
  MovieStatusFilter,
} from "@/components/site/types";
import {
  readStorage as read,
  storageKeys as storage,
  writeStorage as write,
} from "@/lib/client-storage";
import { adminGateway } from "@/lib/admin-gateway";
import { defaultSettings, type SiteSettings } from "@/lib/admin-data";

const getMovieFromPath = (path: string, list: Movie[]) => {
  const clean = path.split("?")[0];
  const seg = decodeURIComponent(clean.split("/").filter(Boolean).pop() || "");
  if (!seg) return undefined;
  const num = Number(seg);
  if (Number.isSafeInteger(num) && num > 0) {
    const byId = list.find((m) => m.id === num);
    if (byId) return byId;
  }
  return list.find((m) => m.slug === seg || String(m.id) === seg);
};

export default function DashboardApp() {
  const router = useRouter(),
    pathname = usePathname();
  const [movies, setMovies] = useState<Movie[]>(() =>
      [...movieSeed].sort((a, b) => b.id - a.id),
    ),
    [favorites, setFavorites] = useState<number[]>([]),
    [history, setHistory] = useState<HistoryItem[]>([]);
  const [user, setUser] = useState<Account | null>(null),
    [ready, setReady] = useState(false),
    [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSettings),
    [theme, setTheme] = useState<ThemeMode>("dark"),
    [query, setQuery] = useState(""),
    [genre, setGenre] = useState("Tất cả"),
    [format, setFormat] = useState<MovieFormat>("all"),
    [statusFilter, setStatusFilter] = useState<MovieStatusFilter>("all"),
    [sort, setSort] = useState<MovieSortOption>("new"),
    [onlyFree, setOnlyFree] = useState<boolean>(false),
    [mobile, setMobile] = useState(false),
    [socialOpen, setSocialOpen] = useState(false),
    [socialPeerId, setSocialPeerId] = useState<number | null>(null),
    [toast, setToast] = useState("");
  const timer = useRef<number | null>(null);
  useEffect(() => {
    let active = true;
    setFavorites(read<number[]>(storage.favorites, []));
    setHistory(read<HistoryItem[]>(storage.history, []));
    const storedAccount = read<Account | null>(storage.user, null);
    const savedTheme = localStorage.getItem(storage.theme);
    const initialTheme: ThemeMode =
      savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";
    setTheme(initialTheme);
    document.documentElement.dataset.mode = initialTheme;
    void Promise.allSettled([
      movieGateway.list(),
      adminGateway.getSettings(),
      apiMode === "production"
        ? authGateway.session()
        : Promise.resolve(storedAccount),
    ]).then(async ([catalogResult, settingsResult, accountResult]) => {
      if (!active) return;

      const failures: string[] = [];

      if (catalogResult.status === "fulfilled") {
        const catalog = [...catalogResult.value].sort((a, b) => b.id - a.id);
        const fallback = [...movieSeed].sort((a, b) => b.id - a.id);
        setMovies(
          catalog.length || apiMode === "production" ? catalog : fallback,
        );
      } else {
        setMovies(
          apiMode === "mock" ? [...movieSeed].sort((a, b) => b.id - a.id) : [],
        );
        failures.push("danh sách phim");
      }

      if (settingsResult.status === "fulfilled") {
        setSiteSettings(settingsResult.value);
      } else {
        setSiteSettings(defaultSettings);
        failures.push("cấu hình website");
      }

      if (accountResult.status === "fulfilled") {
        setUser(accountResult.value);
        if (accountResult.value?.role === "user" && apiMode === "production") {
          try {
            const library = await viewerGateway.library();
            if (!active) return;
            setFavorites(library.favorites);
            setHistory(library.history);
          } catch {
            setFavorites([]);
            setHistory([]);
            failures.push("thư viện cá nhân");
          }
        }
        if (!accountResult.value && apiMode === "production") {
          localStorage.removeItem(storage.user);
        }
      } else {
        setUser(null);
        localStorage.removeItem(storage.user);
        failures.push("phiên đăng nhập");
      }

      if (failures.length) {
        setToast("Một số nội dung chưa tải được. Vui lòng tải lại trang sau.");
      }
      setReady(true);
    });
    return () => {
      active = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  const flash = (message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(""), 2200);
  };
  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(storage.theme, next);
      document.documentElement.dataset.mode = next;
      return next;
    });
  };
  const go = (path: string) => {
    setMobile(false);
    router.push(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const toggleFavorite = (id: number) => {
    const wasFavorite = favorites.includes(id);
    const next = favorites.includes(id)
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];
    setFavorites(next);
    if (apiMode === "production" && user?.role === "user") {
      void viewerGateway.setFavorite(id, !wasFavorite).catch(() => {
        setFavorites((current) =>
          wasFavorite
            ? [...new Set([...current, id])]
            : current.filter((item) => item !== id),
        );
        flash("Chưa thể lưu phim yêu thích. Vui lòng thử lại.");
      });
    } else {
      write(storage.favorites, next);
    }
    flash(
      favorites.includes(id) ? "Đã bỏ khỏi yêu thích" : "Đã thêm vào yêu thích",
    );
  };
  const saveWatchHistory = (item: HistoryItem, next: HistoryItem[]) => {
    setHistory(next);
    if (apiMode === "production" && user?.role === "user") {
      void viewerGateway.saveHistory(item).catch(() => undefined);
    } else {
      write(storage.history, next);
    }
  };
  const watch = (movie: Movie, episode = Math.max(1, movie.episode)) => {
    if (movie.status === "Sắp chiếu") {
      if (movie.trailer) {
        const identifier = movie.slug || movie.id;
        go(`/xem/${identifier}?trailer=1`);
        return;
      }
      flash("Phim sắp phát hành, chưa có trailer");
      return;
    }
    const isSingle = movie.totalEpisodes <= 1;
    const targetEpisode = isSingle ? 1 : episode;
    const identifier = movie.slug || movie.id;
    go(
      isSingle
        ? `/xem/${identifier}`
        : `/xem/${identifier}?tap=${targetEpisode}`,
    );
  };
  const recordView = async (
    movie: Movie,
    _episode: number,
    playbackKey: string,
  ): Promise<void> => {
    // View tracking is background telemetry. Playback must remain uninterrupted
    // and visitors must never see raw API errors if this request fails.
    const { views } = await movieGateway.recordView(movie.id, playbackKey);
    setMovies((current) =>
      current.map((item) => (item.id === movie.id ? { ...item, views } : item)),
    );
  };
  const savePlaybackProgress = (
    movie: Movie,
    episode: number,
    currentTime: number,
    duration: number,
  ) => {
    if (
      !Number.isFinite(currentTime) ||
      !Number.isFinite(duration) ||
      duration <= 0
    )
      return;
    const positionSeconds = Math.max(0, Math.floor(currentTime));
    const durationSeconds = Math.max(1, Math.floor(duration));
    const progress = Math.min(
      100,
      Math.max(0, Math.round((currentTime / duration) * 100)),
    );
    const item: HistoryItem = {
      movieId: movie.id,
      episode,
      watchedAt: new Date().toISOString(),
      progress,
      positionSeconds,
      durationSeconds,
    };
    const next = [
      item,
      ...history.filter((entry) => entry.movieId !== movie.id),
    ].slice(0, 30);
    saveWatchHistory(item, next);
  };
  const handleLogin = (account: Account) => {
    setUser(account);
    if (apiMode === "production" && account.role === "user") {
      setFavorites([]);
      setHistory([]);
      void viewerGateway
        .library()
        .then((library) => {
          setFavorites(library.favorites);
          setHistory(library.history);
        })
        .catch(() => flash("Chưa thể tải thư viện cá nhân."));
    } else {
      write(storage.user, account);
    }
    go(account.role === "admin" ? "/admin" : "/tai-khoan");
  };
  const logout = () => {
    setSocialOpen(false);
    void authGateway.logout().finally(() => {
      localStorage.removeItem(storage.user);
      setUser(null);
      setFavorites(read<number[]>(storage.favorites, []));
      setHistory(read<HistoryItem[]>(storage.history, []));
      go("/");
      flash("Đã đăng xuất");
    });
  };
  const openSocial = (peerId: number | null = null) => {
    setSocialPeerId(peerId);
    setSocialOpen(true);
  };
  const profileId = pathname.startsWith("/nguoi-dung/")
    ? pathname.split("/").filter(Boolean)[1]
    : null;
  const selected = getMovieFromPath(pathname, movies);
  useEffect(() => {
    if (!ready || !selected?.slug || !/^\/(phim|xem)\/\d+$/.test(pathname))
      return;
    const section = pathname.split("/")[1];
    router.replace(`/${section}/${selected.slug}${window.location.search}`, {
      scroll: false,
    });
  }, [ready, selected?.slug, pathname, router]);
  if (!ready)
    return (
      <div className="ha-loading">
        <Logo />
        <span />
      </div>
    );
  if (pathname === "/dang-nhap")
    return (
      <LoginPage
        onLogin={handleLogin}
        allowRegistration={siteSettings.allowRegistration}
        close={() => go("/")}
      />
    );
  if (pathname.startsWith("/admin"))
    return user?.role === "admin" ? (
      <AdminPanel
        account={user}
        movies={movies}
        setMovies={setMovies}
        logout={logout}
        pathname={pathname}
        go={go}
        settings={siteSettings}
        setSettings={setSiteSettings}
      />
    ) : (
      <LoginPage
        onLogin={(account: Account) => {
          setUser(account);
          write(storage.user, account);
          go(account.role === "admin" ? "/admin" : "/");
        }}
        close={() => go("/")}
      />
    );
  return (
    <div className="cinema-app">
      <div className="cinema-ambient-seal">
        <CultivationSeal />
      </div>
      {toast && (
        <div className="ha-toast">
          <Check size={16} />
          {toast}
        </div>
      )}
      <SiteHeader
        user={user}
        query={query}
        setQuery={setQuery}
        go={go}
        mobile={() => setMobile((current) => !current)}
        mobileOpen={mobile}
        logout={logout}
        theme={theme}
        toggleTheme={toggleTheme}
        onSocialOpen={() => openSocial()}
        pathname={pathname}
        format={format}
        setFormat={setFormat}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sort={sort}
        setSort={setSort}
        onlyFree={onlyFree}
        setOnlyFree={setOnlyFree}
        genre={genre}
        setGenre={setGenre}
      />
      {siteSettings.maintenance && (
        <div className="maintenance-banner">
          <Settings /> Hệ thống đang ở chế độ bảo trì. Một số nội dung có thể
          được cập nhật trong thời gian này.
        </div>
      )}
      {mobile && (
        <MobileNav
          user={user}
          go={go}
          close={() => setMobile(false)}
          logout={logout}
          theme={theme}
          toggleTheme={toggleTheme}
          onSocialOpen={() => openSocial()}
          pathname={pathname}
          format={format}
          setFormat={setFormat}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sort={sort}
          setSort={setSort}
          onlyFree={onlyFree}
          setOnlyFree={setOnlyFree}
          genre={genre}
          setGenre={setGenre}
        />
      )}
      {pathname === "/" && (
        <HomePage
          movies={movies}
          go={go}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      )}
      {pathname === "/phim" && (
        <CatalogPage
          movies={movies}
          query={query}
          setQuery={setQuery}
          genre={genre}
          setGenre={setGenre}
          format={format}
          setFormat={setFormat}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sort={sort}
          setSort={setSort}
          onlyFree={onlyFree}
          setOnlyFree={setOnlyFree}
          go={go}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      )}
      {pathname.startsWith("/phim/") &&
        (selected ? (
          <MovieDetail
            movie={selected}
            watch={watch}
            go={go}
            favorite={favorites.includes(selected.id)}
            toggleFavorite={toggleFavorite}
            user={user}
          />
        ) : (
          <NotFoundPage go={go} />
        ))}
      {pathname.startsWith("/xem/") &&
        (selected ? (
          <WatchPage
            key={selected.id}
            movie={selected}
            movies={movies}
            go={go}
            onWatch={watch}
            onView={recordView}
            onProgress={savePlaybackProgress}
            historyItem={history.find((item) => item.movieId === selected.id)}
            favorite={favorites.includes(selected.id)}
            toggleFavorite={toggleFavorite}
            user={user}
          />
        ) : (
          <NotFoundPage go={go} />
        ))}
      {pathname === "/yeu-thich" && (
        <LibraryPage
          title="Phim yêu thích"
          eyebrow="BỘ SƯU TẬP CỦA BẠN"
          movies={movies.filter((movie) => favorites.includes(movie.id))}
          empty="Bạn chưa lưu bộ phim nào."
          go={go}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      )}
      {pathname === "/lich-su" && (
        <HistoryPage
          movies={movies}
          history={history}
          go={go}
          watch={watch}
          onClear={() => {
            const previous = history;
            setHistory([]);
            if (apiMode === "production" && user?.role === "user") {
              void viewerGateway.clearHistory().catch(() => {
                setHistory(previous);
                flash("Chưa thể xóa lịch sử xem.");
              });
            } else {
              write(storage.history, []);
            }
          }}
        />
      )}
      {pathname === "/tai-khoan" &&
        (user ? (
          <ProfilePage
            key={user.id ?? user.email}
            user={user}
            setUser={setUser}
            go={go}
            logout={logout}
          />
        ) : (
          <LoginPage
            onLogin={handleLogin}
            allowRegistration={siteSettings.allowRegistration}
            close={() => go("/")}
          />
        ))}
      {profileId !== null &&
        (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          profileId,
        ) ? (
          <PublicProfilePage
            id={profileId}
            viewer={user}
            go={go}
            openMessages={(peerId) => openSocial(peerId)}
          />
        ) : (
          <NotFoundPage go={go} />
        ))}
      {!["/", "/phim", "/yeu-thich", "/lich-su", "/tai-khoan"].includes(
        pathname,
      ) &&
        !pathname.startsWith("/nguoi-dung/") &&
        !pathname.startsWith("/phim/") &&
        !pathname.startsWith("/xem/") && <NotFoundPage go={go} />}
      <SiteFooter go={go} />
      {socialOpen && user && (
        <SocialPanel
          user={user}
          initialPeerId={socialPeerId}
          close={() => setSocialOpen(false)}
          go={go}
        />
      )}
    </div>
  );
}
