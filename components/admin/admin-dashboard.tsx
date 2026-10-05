"use client";

import {
  Activity,
  CalendarClock,
  ChevronRight,
  Film,
  Flame,
  Radio,
  Sparkles,
  Star,
  TrendingUp,
  Tv,
  Users,
} from "lucide-react";
import { MovieArt } from "@/components/ui/movie-art";
import { formatCompactNumber as compact, formatMovieBadge } from "@/lib/format";
import type { Viewer } from "@/lib/admin-data";
import type { Movie } from "@/lib/movies";
import type { Navigate } from "@/components/admin/types";

type AdminDashboardProps = {
  movies: Movie[];
  viewers: Viewer[];
  go: Navigate;
};

export default function AdminDashboard({
  movies,
  viewers,
  go,
}: AdminDashboardProps) {
  const totalViews = movies.reduce(
    (sum: number, movie: Movie) => sum + movie.views,
    0,
  );
  const averageRating = movies.length
    ? movies.reduce((sum: number, movie: Movie) => sum + movie.rating, 0) /
      movies.length
    : 0;

  const fourKCount = movies.filter((m) => m.quality === "4K").length;
  const seriesCount = movies.filter((m) => m.totalEpisodes > 1).length;
  const singleCount = movies.filter((m) => m.totalEpisodes <= 1).length;
  const featuredCount = movies.filter((m) => m.featured).length;
  const airingCount = movies.filter((m) => m.status === "Đang chiếu").length;
  const completedCount = movies.filter((m) => m.status === "Hoàn thành").length;
  const upcomingCount = movies.filter((m) => m.status === "Sắp chiếu").length;

  const statusSummary = [
    { status: "Đang chiếu", count: airingCount, tone: "#38bdf8" },
    { status: "Hoàn thành", count: completedCount, tone: "#34d399" },
    { status: "Sắp chiếu", count: upcomingCount, tone: "#f59e0b" },
  ];

  const completedEpisodes = movies.reduce(
    (sum: number, movie: Movie) => sum + movie.episode,
    0,
  );
  const totalEpisodes = movies.reduce(
    (sum: number, movie: Movie) => sum + movie.totalEpisodes,
    0,
  );
  const episodesProgress = totalEpisodes
    ? Math.round((completedEpisodes / totalEpisodes) * 100)
    : 0;

  // Estimated bandwidth calculation (avg 350MB per view streamed)
  const bandwidthGB = (totalViews * 0.35).toFixed(1);
  const bandwidthDisplay =
    Number(bandwidthGB) >= 1000
      ? `${(Number(bandwidthGB) / 1024).toFixed(2)} TB`
      : `${bandwidthGB} GB`;

  // Airing week schedule
  const daysOfWeek = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];
  const currentDayName =
    ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"][
      new Date().getDay()
    ];
  const todayAiringCount = movies.filter(
    (m) => m.updateDay === currentDayName && m.status === "Đang chiếu",
  ).length;

  // Top 10 Trending
  const top10 = [...movies]
    .sort((a: Movie, b: Movie) => b.views - a.views)
    .slice(0, 10);
  const maxViews = Math.max(...top10.map((item) => item.views), 1);

  // VIP & Cultivation Stats
  const vipCount = viewers.filter((v: Viewer) => v.plan === "VIP").length;
  const highRealmCount = viewers.filter(
    (v: Viewer) => (v.cultivationXp ?? 0) >= 300,
  ).length;

  // Attention Movies (almost finished or 0 views)
  const attentionMovies = movies
    .filter(
      (m: Movie) =>
        m.views === 0 ||
        (m.status === "Đang chiếu" &&
          m.totalEpisodes > 1 &&
          m.totalEpisodes - m.episode <= 2),
    )
    .slice(0, 6);

  return (
    <div className="admin-dashboard-root">
      {/* 4 Hero KPI Cards */}
      <section className="executive-kpi-grid">
        <article className="exec-kpi-card card-cyan">
          <div className="exec-kpi-top">
            <div className="exec-kpi-icon">
              <Film />
            </div>
            <span className="exec-kpi-trend up">
              <Sparkles size={12} /> {fourKCount} bản 4K
            </span>
          </div>
          <div className="exec-kpi-metric">
            <strong>{movies.length}</strong>
            <span>Tổng tác phẩm</span>
          </div>
          <div className="exec-kpi-sub">
            <small>
              <b>{seriesCount}</b> phim bộ · <b>{singleCount}</b> phim lẻ ·{" "}
              <b>{featuredCount}</b> nổi bật
            </small>
          </div>
        </article>

        <article className="exec-kpi-card card-amber">
          <div className="exec-kpi-top">
            <div className="exec-kpi-icon">
              <Flame />
            </div>
            <span className="exec-kpi-trend hot">
              <Activity size={12} /> Băng thông: {bandwidthDisplay}
            </span>
          </div>
          <div className="exec-kpi-metric">
            <strong>{compact(totalViews)}</strong>
            <span>Lượt phát trực tuyến</span>
          </div>
          <div className="exec-kpi-sub">
            <small>
              Điểm TB: <b>{averageRating.toFixed(1)}/10 ★</b> ·{" "}
              <b>{airingCount}</b> phim đang phát sóng
            </small>
          </div>
        </article>

        <article className="exec-kpi-card card-purple">
          <div className="exec-kpi-top">
            <div className="exec-kpi-icon">
              <Users />
            </div>
            <span className="exec-kpi-trend vip">
              <Star size={12} /> {vipCount} Đạo Hữu VIP
            </span>
          </div>
          <div className="exec-kpi-metric">
            <strong>{viewers.length}</strong>
            <span>Thành viên cộng đồng</span>
          </div>
          <div className="exec-kpi-sub">
            <small>
              <b>{highRealmCount}</b> cao thủ Trúc Cơ+ ·{" "}
              <b>
                {viewers.filter((v) => v.status === "Đang hoạt động").length}
              </b>{" "}
              hoạt động
            </small>
          </div>
        </article>

        <article className="exec-kpi-card card-emerald">
          <div className="exec-kpi-top">
            <div className="exec-kpi-icon">
              <TrendingUp />
            </div>
            <span className="exec-kpi-trend good">
              {episodesProgress}% hoàn thành
            </span>
          </div>
          <div className="exec-kpi-metric">
            <strong>
              {completedEpisodes}
              <small className="exec-metric-total">/{totalEpisodes}</small>
            </strong>
            <span>Tập phim đã phát hành</span>
          </div>
          <div className="exec-kpi-sub">
            <div className="exec-progress-bar">
              <i style={{ width: `${episodesProgress}%` }} />
            </div>
            <small>
              {todayAiringCount > 0 ? (
                <>
                  Hôm nay ({currentDayName}): <b>{todayAiringCount} phim</b> ra
                  tập mới
                </>
              ) : (
                "Hôm nay không có lịch cập nhật mới"
              )}
            </small>
          </div>
        </article>
      </section>

      {/* Main Operations Split: Top 10 Chart & Schedule Airing Matrix */}
      <div className="admin-operations-grid">
        {/* Left Column: Top 10 Trending Phim */}
        <section className="admin-card-section trending-section">
          <div className="admin-section-header">
            <div>
              <div className="section-tagline">
                <Flame size={14} />
                <span>BẢNG XẾP HẠNG THỊNH HÀNH</span>
              </div>
              <h2>Top 10 Phim Xem Nhiều Nhất</h2>
            </div>
            <button
              type="button"
              className="admin-link-btn"
              onClick={() => go("/admin/phim")}
            >
              <span>Kho phim</span>
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="top-trending-list">
            {top10.map((movie: Movie, index: number) => {
              const rank = index + 1;
              const viewPct = Math.round((movie.views / maxViews) * 100);
              return (
                <div
                  className={`trending-row rank-${rank <= 3 ? rank : "default"}`}
                  key={movie.id}
                  onClick={() => go(`/phim/${movie.slug}`)}
                  title={`Xem trang phim "${movie.title}"`}
                  role="button"
                  tabIndex={0}
                >
                  <div className="trending-rank-cell">
                    {rank === 1 && <span className="rank-badge gold">1</span>}
                    {rank === 2 && <span className="rank-badge silver">2</span>}
                    {rank === 3 && <span className="rank-badge bronze">3</span>}
                    {rank > 3 && (
                      <span className="rank-badge normal">{rank}</span>
                    )}
                  </div>

                  <div className="trending-poster-cell">
                    <MovieArt movie={movie} />
                  </div>

                  <div className="trending-info-cell">
                    <div className="trending-title-wrap">
                      <strong className="trending-movie-title">
                        {movie.title}
                      </strong>
                      <span className="trending-original-title">
                        {movie.originalTitle || movie.studio}
                      </span>
                    </div>
                    <div className="trending-meta-pills">
                      <span className="meta-pill status-pill-mini">
                        {movie.status}
                      </span>
                      <span className="meta-pill ep-pill">
                        {movie.totalEpisodes <= 1
                          ? "Bản Full"
                          : `Tập ${movie.episode}/${movie.totalEpisodes}`}
                      </span>
                      <span className="meta-pill genre-pill">
                        {movie.genres.slice(0, 2).join(" · ")}
                      </span>
                    </div>
                  </div>

                  <div className="trending-score-cell">
                    <span className="rating-star">
                      <Star size={12} fill="#eab308" color="#eab308" />
                      <b>{movie.rating.toFixed(1)}</b>
                    </span>
                    <small>{compact(movie.views)} lượt</small>
                  </div>

                  <div className="trending-bar-cell">
                    <div
                      className="view-share-bar"
                      title={`${viewPct}% thị phần so với Top 1`}
                    >
                      <i style={{ width: `${viewPct}%` }} />
                    </div>
                    <span className="view-share-number">
                      {compact(movie.views)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Weekly Airing Calendar & Status Chart */}
        <div className="admin-side-stack">
          {/* Weekly Airing Calendar Matrix */}
          <section className="admin-card-section schedule-matrix-section">
            <div className="admin-section-header">
              <div>
                <div className="section-tagline">
                  <CalendarClock size={14} />
                  <span>CHU KỲ PHÁT HÀNH 7 NGÀY</span>
                </div>
                <h2>Lịch Chiếu Trong Tuần</h2>
              </div>
              <button
                type="button"
                className="admin-link-btn"
                onClick={() => go("/admin/lich-chieu")}
              >
                <span>Chi tiết</span>
                <ChevronRight size={15} />
              </button>
            </div>

            <div className="weekly-matrix-grid">
              {daysOfWeek.map((day) => {
                const dayMovies = movies.filter(
                  (m: Movie) =>
                    m.updateDay === day && m.status === "Đang chiếu",
                );
                const isToday = day === currentDayName;
                return (
                  <div
                    className={`day-matrix-card ${isToday ? "today-highlight" : ""}`}
                    key={day}
                    onClick={() => go("/admin/lich-chieu")}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="day-matrix-header">
                      <b>{day}</b>
                      {isToday && <span className="today-badge">Hôm nay</span>}
                    </div>
                    <div className="day-matrix-count">
                      <strong>{dayMovies.length}</strong>
                      <small>phim</small>
                    </div>
                    <div className="day-matrix-preview">
                      {dayMovies.slice(0, 2).map((m) => (
                        <span
                          key={m.id}
                          className="preview-chip"
                          title={m.title}
                        >
                          {m.title}
                        </span>
                      ))}
                      {dayMovies.length > 2 && (
                        <span className="preview-more">
                          +{dayMovies.length - 2}
                        </span>
                      )}
                      {dayMovies.length === 0 && (
                        <span className="preview-empty">Trống</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Library Status Ratio */}
          <section className="admin-card-section library-ratio-section">
            <div className="admin-section-header">
              <div>
                <div className="section-tagline">
                  <Tv size={14} />
                  <span>PHÂN BỔ TRẠNG THÁI THƯ VIỆN</span>
                </div>
                <h2>Trạng Thái Phim</h2>
              </div>
            </div>

            <div className="ratio-stacked-bars">
              {statusSummary.map((item) => {
                const pct = movies.length
                  ? Math.round((item.count / movies.length) * 100)
                  : 0;
                return (
                  <div className="ratio-bar-item" key={item.status}>
                    <div className="ratio-header">
                      <span className="ratio-status-label">
                        <i style={{ background: item.tone }} />
                        {item.status}
                      </span>
                      <span className="ratio-count">
                        <b>{item.count}</b> phim ({pct}%)
                      </span>
                    </div>
                    <div className="ratio-track">
                      <i style={{ width: `${pct}%`, background: item.tone }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Bottom Attention & Alerts Panel */}
      <section className="admin-card-section attention-alerts-section">
        <div className="admin-section-header">
          <div>
            <div className="section-tagline">
              <Radio size={14} />
              <span>HÀNH ĐỘNG CẦN CHÚ Ý</span>
            </div>
            <h2>Theo Dõi & Nhắc Nhở Vận Hành</h2>
          </div>
          <button
            type="button"
            className="admin-link-btn"
            onClick={() => go("/admin/phim")}
          >
            <span>Tất cả phim</span>
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="attention-cards-grid">
          {attentionMovies.map((movie: Movie) => {
            const isFinishedSoon =
              movie.status === "Đang chiếu" &&
              movie.totalEpisodes > 1 &&
              movie.totalEpisodes - movie.episode <= 2;

            return (
              <article className="attention-card" key={movie.id}>
                <div className="attention-poster">
                  <MovieArt movie={movie} />
                </div>
                <div className="attention-body">
                  <b className="attention-title">{movie.title}</b>
                  <div className="attention-meta">
                    <span>
                      {movie.status} · {formatMovieBadge(movie)}
                    </span>
                    <span>{movie.updateDay}</span>
                  </div>
                  <div className="attention-action-row">
                    <span
                      className={`attention-tag ${isFinishedSoon ? "warning" : "info"}`}
                    >
                      {isFinishedSoon ? "⚡ Sắp hoàn thành" : "👁️ Mới thêm"}
                    </span>
                    <button
                      type="button"
                      className="attention-manage-btn"
                      onClick={() => go("/admin/phim")}
                    >
                      Quản lý
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
