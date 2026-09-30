import { CalendarDays, Clock3 } from "lucide-react";
import { MovieCard, SectionTitle } from "@/components/site/home-page";
import type { Movie } from "@/lib/movies";
import type { Navigate } from "@/components/site/types";

type SchedulePageProps = {
  movies: Movie[];
  go: Navigate;
  favorites: number[];
  toggleFavorite: (id: number) => void;
};

export default function SchedulePage({ movies, go, favorites, toggleFavorite }: SchedulePageProps) {
  const days = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];
  
  const todayIndex = new Date().getDay();
  const todayName = days[todayIndex === 0 ? 6 : todayIndex - 1];

  return (
    <main>
      <section className="catalog-header">
        <SectionTitle
          eyebrow="LỊCH PHÁT SÓNG"
          title="Lịch chiếu phim tuần này"
        />
        <p style={{ marginTop: -15, marginBottom: 30, color: "var(--ha-text-muted)" }}>
          Đừng bỏ lỡ các tập phim mới nhất. Phim có huy hiệu <b style={{ color: "#ef4444" }}>"Hôm nay"</b> là phim vừa ra lò.
        </p>
      </section>
      
      <section style={{ padding: "0 var(--ha-page-padding)", display: "flex", flexDirection: "column", gap: 40, paddingBottom: 60 }}>
        {days.map((day) => {
          const dayMovies = movies
            .filter((m) => m.updateDay === day && m.status === "Đang chiếu")
            .sort((a, b) => b.id - a.id);
            
          if (!dayMovies.length) return null;
          
          const isToday = day === todayName;

          return (
            <div key={day} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <CalendarDays size={20} color={isToday ? "#a78bfa" : "var(--ha-text-muted)"} />
                <h2 style={{ fontSize: 20, color: isToday ? "#c4b5fd" : "var(--ha-text-main)", margin: 0 }}>{day}</h2>
                {isToday && (
                  <span style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: "bold" }}>
                    Hôm nay
                  </span>
                )}
              </div>
              <div className="catalog-grid">
                {dayMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} go={go} favorites={favorites} toggleFavorite={toggleFavorite} />
                ))}
              </div>
            </div>
          );
        })}
        
        <div style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <Clock3 size={20} color="var(--ha-text-muted)" />
            <h2 style={{ fontSize: 20, color: "var(--ha-text-main)", margin: 0 }}>Sắp chiếu</h2>
          </div>
          <div className="catalog-grid">
            {movies.filter(m => m.status === "Sắp chiếu").map((movie) => (
              <MovieCard key={movie.id} movie={movie} go={go} favorites={favorites} toggleFavorite={toggleFavorite} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
