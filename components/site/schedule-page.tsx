"use client";

import { useState } from "react";
import { CalendarDays, Clock3, Flame } from "lucide-react";
import { MovieCard } from "@/components/site/home-page";
import type { Movie } from "@/lib/movies";
import type { Navigate } from "@/components/site/types";

type SchedulePageProps = {
  movies: Movie[];
  go: Navigate;
  favorites: number[];
  toggleFavorite: (id: number) => void;
};

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const DAY_SHORT = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function SchedulePage({ movies, go, favorites, toggleFavorite }: SchedulePageProps) {
  const todayDow = new Date().getDay(); // 0 = Sun … 6 = Sat
  const todayIdx = todayDow === 0 ? 6 : todayDow - 1; // map to our 0-based (Mon=0…Sun=6)
  const todayName = DAYS[todayIdx];

  const [activeDay, setActiveDay] = useState<string | null>(null);
  const displayDay = activeDay ?? todayName;

  // All "Đang chiếu" movies grouped by day
  const airing = movies.filter((m) => m.status === "Đang chiếu");
  const upcoming = movies.filter((m) => m.status === "Sắp chiếu");

  const dayMovies = (day: string) =>
    airing.filter((m) => m.updateDay === day).sort((a, b) => b.id - a.id);

  const activeDayMovies = dayMovies(displayDay);

  return (
    <main className="schedule-page">
      {/* ── HERO HEADER ────────────────────────────────── */}
      <div className="schedule-hero">
        <div className="schedule-hero-inner">
          <div className="schedule-hero-left">
            <div className="schedule-eyebrow">
              <CalendarDays size={15} />
              LỊCH PHÁT SÓNG
            </div>
            <h1 className="schedule-hero-title">Lịch chiếu<br />phim tuần này</h1>
            <p className="schedule-hero-sub">
              Đừng bỏ lỡ các tập mới nhất mỗi ngày.&nbsp;
              <span className="schedule-today-tag">Hôm nay</span>
              &nbsp;là ngày đang phát sóng.
            </p>
          </div>
          <div className="schedule-hero-stats">
            <div className="schedule-stat">
              <span className="schedule-stat-num">{airing.length}</span>
              <span className="schedule-stat-label">Đang chiếu</span>
            </div>
            <div className="schedule-stat-divider" />
            <div className="schedule-stat">
              <span className="schedule-stat-num">{upcoming.length}</span>
              <span className="schedule-stat-label">Sắp chiếu</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── DAY SELECTOR TAB BAR ───────────────────────── */}
      <div className="schedule-tab-wrap">
        <div className="schedule-tabs">
          {DAYS.map((day, i) => {
            const count = dayMovies(day).length;
            const isToday = day === todayName;
            const isActive = day === displayDay;
            return (
              <button
                key={day}
                className={`schedule-tab ${isActive ? "schedule-tab--active" : ""} ${isToday ? "schedule-tab--today" : ""}`}
                onClick={() => setActiveDay(day)}
              >
                <span className="schedule-tab-short">{DAY_SHORT[i]}</span>
                <span className="schedule-tab-full">{day}</span>
                {count > 0 && <span className="schedule-tab-badge">{count}</span>}
                {isToday && <span className="schedule-tab-dot" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DAY CONTENT ───────────────────────────────── */}
      <section className="schedule-content">
        <div className="schedule-day-header">
          <div className="schedule-day-title-row">
            <h2 className="schedule-day-name">
              {displayDay}
              {displayDay === todayName && (
                <span className="schedule-hom-nay-pill">Hôm nay</span>
              )}
            </h2>
            <span className="schedule-day-count">{activeDayMovies.length} bộ phim</span>
          </div>
        </div>

        {activeDayMovies.length > 0 ? (
          <div className="catalog-grid schedule-grid">
            {activeDayMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                go={go}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="schedule-empty">
            <CalendarDays size={48} />
            <p>Không có phim nào phát sóng vào {displayDay}</p>
          </div>
        )}

        {/* ── SẮP CHIẾU ─────────────────────────────────── */}
        {upcoming.length > 0 && (
          <div className="schedule-upcoming">
            <div className="schedule-section-header">
              <div className="schedule-section-icon">
                <Flame size={18} />
              </div>
              <div>
                <h3 className="schedule-section-title">Sắp chiếu</h3>
                <p className="schedule-section-sub">Những bộ phim sắp ra mắt</p>
              </div>
            </div>
            <div className="catalog-grid schedule-grid">
              {upcoming.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  go={go}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
