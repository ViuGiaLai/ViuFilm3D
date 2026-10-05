"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Film,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { MovieArt } from "@/components/ui/movie-art";
import { formatCompactNumber as compact, formatMovieBadge } from "@/lib/format";
import type { Movie } from "@/lib/movies";
import type { EditMovie, PatchMovie } from "@/components/admin/types";

type AdminScheduleProps = {
  movies: Movie[];
  edit: EditMovie;
  patch: PatchMovie;
};

const allDays = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
  "Trọn bộ",
];

export default function AdminSchedule({
  movies,
  edit,
  patch,
}: AdminScheduleProps) {
  const [keyword, setKeyword] = useState("");
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const daysOfWeek = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];
  const currentDayName = daysOfWeek[new Date().getDay()];

  const todayMovies = useMemo(
    () =>
      movies.filter(
        (m) => m.updateDay === currentDayName && m.status === "Đang chiếu",
      ),
    [movies, currentDayName],
  );

  const airingMovies = useMemo(
    () => movies.filter((m) => m.status === "Đang chiếu"),
    [movies],
  );

  const totalReleasedEpisodes = useMemo(
    () => movies.reduce((sum, m) => sum + m.episode, 0),
    [movies],
  );

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const matchSearch = `${movie.title} ${movie.originalTitle} ${movie.studio}`
        .toLowerCase()
        .includes(keyword.trim().toLowerCase());
      const matchDay =
        selectedDay === "all"
          ? true
          : selectedDay === "today"
            ? movie.updateDay === currentDayName && movie.status === "Đang chiếu"
            : movie.updateDay === selectedDay;
      const matchStatus =
        statusFilter === "all" ? true : movie.status === statusFilter;
      return matchSearch && matchDay && matchStatus;
    });
  }, [movies, keyword, selectedDay, statusFilter, currentDayName]);

  const handleIncrementEpisode = async (movie: Movie) => {
    if (movie.totalEpisodes > 1 && movie.episode < movie.totalEpisodes) {
      const nextEp = movie.episode + 1;
      await patch(movie.id, {
        episode: nextEp,
        status: nextEp >= movie.totalEpisodes ? "Hoàn thành" : "Đang chiếu",
      });
    }
  };

  const handleDayChange = async (movie: Movie, newDay: string) => {
    if (movie.updateDay === newDay) return;
    await patch(movie.id, { updateDay: newDay });
  };

  const daysToRender = useMemo(() => {
    if (selectedDay === "all") return allDays;
    if (selectedDay === "today") return [currentDayName];
    return [selectedDay];
  }, [selectedDay, currentDayName]);

  return (
    <div className="schedule-admin-root">
      {/* Hero Airing Radar Strip */}
      <div className="admin-summary-strip schedule-hero-strip">
        <article
          className={`schedule-hero-card ${selectedDay === "today" ? "active" : ""}`}
          onClick={() => setSelectedDay(selectedDay === "today" ? "all" : "today")}
          role="button"
          tabIndex={0}
        >
          <div className="schedule-hero-icon today-icon">
            <Sparkles />
          </div>
          <div className="schedule-hero-info">
            <span>Phát sóng hôm nay ({currentDayName})</span>
            <strong>{todayMovies.length} phim</strong>
            <small>
              {selectedDay === "today" ? "Đang lọc hiển thị" : "Click để xem nhanh"}
            </small>
          </div>
        </article>

        <article className="schedule-hero-card">
          <div className="schedule-hero-icon airing-icon">
            <CalendarClock />
          </div>
          <div className="schedule-hero-info">
            <span>Đang chiếu trong tuần</span>
            <strong>{airingMovies.length} phim</strong>
            <small>Cập nhật theo chu kỳ 7 ngày</small>
          </div>
        </article>

        <article className="schedule-hero-card">
          <div className="schedule-hero-icon ep-icon">
            <Film />
          </div>
          <div className="schedule-hero-info">
            <span>Tập đã phát hành</span>
            <strong>{totalReleasedEpisodes} tập</strong>
            <small>Toàn bộ kho phim ViuFilm3D</small>
          </div>
        </article>

        <article className="schedule-hero-card">
          <div className="schedule-hero-icon upcoming-icon">
            <Clock3 />
          </div>
          <div className="schedule-hero-info">
            <span>Phim sắp ra mắt</span>
            <strong>
              {movies.filter((m) => m.status === "Sắp chiếu").length} phim
            </strong>
            <small>Đang chuẩn bị bản dịch & stream</small>
          </div>
        </article>
      </div>

      {/* Toolbar Filter */}
      <div className="schedule-filter-toolbar">
        <div className="catalog-search schedule-search">
          <Search size={16} />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm phim theo tên, xưởng phim để kiểm tra lịch..."
          />
        </div>

        <div className="schedule-toolbar-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="schedule-status-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đang chiếu">Đang chiếu</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Sắp chiếu">Sắp chiếu</option>
          </select>
        </div>
      </div>

      {/* Day Navigation Tabs */}
      <div className="schedule-day-tabs">
        <button
          type="button"
          className={`schedule-day-tab ${selectedDay === "all" ? "active" : ""}`}
          onClick={() => setSelectedDay("all")}
        >
          <span>Tất cả ngày</span>
          <span className="tab-count">{movies.length}</span>
        </button>

        <button
          type="button"
          className={`schedule-day-tab today-tab ${selectedDay === "today" ? "active" : ""}`}
          onClick={() => setSelectedDay("today")}
        >
          <span className="live-dot" />
          <span>Hôm nay ({currentDayName})</span>
          <span className="tab-count highlight">{todayMovies.length}</span>
        </button>

        {allDays.map((day) => {
          const count = movies.filter((m) => m.updateDay === day).length;
          return (
            <button
              type="button"
              key={day}
              className={`schedule-day-tab ${selectedDay === day ? "active" : ""}`}
              onClick={() => setSelectedDay(day)}
            >
              <span>{day}</span>
              <span className="tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Schedule Board */}
      <div className="schedule-board-container">
        {daysToRender.map((day) => {
          const dayMovies = filteredMovies
            .filter((movie) => movie.updateDay === day)
            .sort((a, b) => b.views - a.views);
          const isToday = day === currentDayName;

          if (selectedDay !== "all" && dayMovies.length === 0) return null;

          return (
            <section
              className={`schedule-day-column ${isToday ? "today-column" : ""}`}
              key={day}
            >
              <header className="schedule-column-header">
                <div className="column-title-group">
                  <div className="column-day-badge">
                    <CalendarDays size={16} />
                    <b>{day}</b>
                    {isToday && <span className="today-badge">Hôm nay</span>}
                  </div>
                  <span className="column-movie-count">
                    {dayMovies.length} phim
                  </span>
                </div>
              </header>

              <div className="schedule-cards-list">
                {dayMovies.map((movie) => {
                  const progressPct =
                    movie.totalEpisodes <= 1
                      ? 100
                      : Math.round(
                          (movie.episode / movie.totalEpisodes) * 100,
                        );
                  const canIncrement =
                    movie.totalEpisodes > 1 &&
                    movie.episode < movie.totalEpisodes;

                  return (
                    <article className="schedule-movie-item" key={movie.id}>
                      <div className="schedule-thumb-box">
                        <MovieArt movie={movie} />
                        <span className="schedule-thumb-quality">
                          {movie.quality}
                        </span>
                      </div>

                      <div className="schedule-item-content">
                        <div className="schedule-title-row">
                          <strong
                            className="schedule-movie-name"
                            title={movie.title}
                          >
                            {movie.title}
                          </strong>
                          <span className="schedule-score">
                            <Star size={11} fill="#eab308" color="#eab308" />
                            {movie.rating.toFixed(1)}
                          </span>
                        </div>

                        <div className="schedule-meta-row">
                          <span className="schedule-studio">
                            {movie.studio} · {compact(movie.views)} lượt xem
                          </span>
                        </div>

                        <div className="schedule-progress-row">
                          <div className="progress-labels">
                            <span className="ep-status-text">
                              {movie.totalEpisodes <= 1
                                ? "Bản Full (Trọn bộ)"
                                : formatMovieBadge(movie)}
                            </span>
                            <span className="progress-percent">
                              {progressPct}%
                            </span>
                          </div>
                          <div className="schedule-progress-bar">
                            <i style={{ width: `${progressPct}%` }} />
                          </div>
                        </div>

                        <div className="schedule-control-row">
                          <div className="schedule-day-changer">
                            <label>Lịch:</label>
                            <select
                              value={movie.updateDay}
                              onChange={(e) =>
                                handleDayChange(movie, e.target.value)
                              }
                              title="Thay đổi ngày phát sóng"
                            >
                              {allDays.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="schedule-actions-group">
                            {canIncrement && (
                              <button
                                type="button"
                                className="schedule-release-btn"
                                onClick={() => handleIncrementEpisode(movie)}
                                title={`Phát tập ${movie.episode + 1}`}
                              >
                                <Plus size={13} />
                                <span>Tập {movie.episode + 1}</span>
                              </button>
                            )}

                            {!canIncrement && movie.totalEpisodes > 1 && (
                              <span className="schedule-completed-badge">
                                <CheckCircle2 size={12} /> Trọn bộ
                              </span>
                            )}

                            <a
                              href={`/phim/${movie.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="schedule-icon-btn"
                              title="Xem thử trang phim"
                            >
                              <ExternalLink size={14} />
                            </a>

                            <button
                              type="button"
                              className="schedule-icon-btn"
                              onClick={() => edit(movie)}
                              title="Chỉnh sửa chi tiết phim"
                            >
                              <Pencil size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {!dayMovies.length && (
                  <div className="schedule-empty-column">
                    <p>Không có phim nào xếp lịch ngày này.</p>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
