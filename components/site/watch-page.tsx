"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Film,
  Maximize2,
  Minimize2,
  Plus,
} from "lucide-react";
import type { Movie } from "@/lib/movies";
import type { Account, HistoryItem } from "@/lib/app-types";
import MovieComments from "@/components/site/movie-comments";
import type { Navigate, WatchMovie } from "@/components/site/types";
import { mediaGateway } from "@/lib/media-gateway";
import { apiMode } from "@/lib/config";
import CustomPlayer from "@/components/site/custom-player";

type WatchPageProps = {
  movie: Movie;
  movies?: Movie[];
  go: Navigate;
  onWatch: WatchMovie;
  onView: (movie: Movie, episode: number, playbackKey: string) => Promise<void>;
  onProgress: (
    movie: Movie,
    episode: number,
    currentTime: number,
    duration: number,
  ) => void;
  historyItem?: HistoryItem;
  favorite?: boolean;
  toggleFavorite?: (id: number) => void;
  user: Account | null;
};

export default function WatchPage({
  movie,
  go,
  onWatch,
  onView,
  onProgress,
  historyItem,
  favorite = false,
  toggleFavorite,
  user,
}: WatchPageProps) {
  const searchParams = useSearchParams();
  const tapQuery = searchParams.get("tap");
  const trailerQuery = searchParams.get("trailer");
  const parsedTap = tapQuery ? Number(tapQuery) : NaN;
  const isSingle = movie.totalEpisodes <= 1;

  const initialEp =
    Number.isInteger(parsedTap) && parsedTap > 0
      ? parsedTap
      : isSingle
        ? 1
        : movie.episode;

  const [episode, setEpisode] = useState(initialEp);
  const [isExpanded, setIsExpanded] = useState(false);
  const playerColumnRef = useRef<HTMLElement>(null);
  const reportedViewsRef = useRef<Set<string>>(new Set());
  const viewRetryAtRef = useRef<Map<string, number>>(new Map());
  const lastProgressReportRef = useRef<{ key: string; seconds: number }>({
    key: "",
    seconds: 0,
  });
  const watchProgressRef = useRef({
    playbackKey: "",
    lastVideoTime: 0,
    watchedSeconds: 0,
  });
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [showTrailer, setShowTrailer] = useState(
    Boolean(trailerQuery) ||
      (movie.status === "Sắp chiếu" && Boolean(movie.trailer)),
  );

  useEffect(() => {
    if (Number.isInteger(parsedTap) && parsedTap > 0) {
      setEpisode(parsedTap);
      setShowTrailer(false);
    }
  }, [parsedTap]);

  // Clean URL if single movie was navigated with ?tap=1 (chỉ xóa nếu có tap=, không xóa trailer)
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      isSingle &&
      window.location.search.includes("tap=")
    ) {
      const identifier = movie.slug || movie.id;
      window.history.replaceState(null, "", `/xem/${identifier}`);
    }
  }, [isSingle, movie.slug, movie.id]);

  const trailerVideo = movie.trailer || "";

  const currentEpisodeItem = isSingle
    ? undefined
    : movie.episodes?.find((item) => item.episode === episode) ||
      movie.episodes?.find((item) => {
        if (!item.video || !item.title) return false;
        const match = item.title.match(/(\d+)\s*-\s*(\d+)/);
        if (!match) return false;
        const start = parseInt(match[1], 10);
        const end = parseInt(match[2], 10);
        return episode >= start && episode <= end;
      });

  const currentEpisodeVideo = showTrailer
    ? trailerVideo
    : isSingle
      ? movie.video
      : currentEpisodeItem?.video || (episode === 1 ? movie.video : "");

  const currentEpisodeAudio = showTrailer
    ? undefined
    : isSingle
      ? movie.audio
      : currentEpisodeItem?.audio || (episode === 1 ? movie.audio : undefined);

  const [media, setMedia] = useState<{
    source: string;
    video: string;
    poster?: string;
    subtitle?: string;
    audio?: string;
  }>({ source: "", video: "" });
  const [mediaLoading, setMediaLoading] = useState(
    Boolean(currentEpisodeVideo),
  );
  const [mediaError, setMediaError] = useState("");
  const refreshedMediaRef = useRef<Set<string>>(new Set());
  const activeMediaSourceRef = useRef(currentEpisodeVideo);
  activeMediaSourceRef.current = currentEpisodeVideo;

  useEffect(() => {
    let active = true;
    setMediaError("");
    setMedia({ source: currentEpisodeVideo, video: "" });
    setMediaLoading(Boolean(currentEpisodeVideo));

    if (!currentEpisodeVideo) {
      setMediaLoading(false);
      setMediaError(
        showTrailer
          ? "Trailer đang được cập nhật. Vui lòng thử lại sau."
          : `Tập ${episode} đang được cập nhật video. Bạn có thể chọn các tập khác trong danh sách.`,
      );
      return;
    }

    // Start the video as soon as its URL is ready. Optional media must not
    // delay playback or turn a usable video into an error state.
    void mediaGateway
      .resolve(currentEpisodeVideo)
      .then((video) => {
        if (!active) return;
        if (!video) throw new Error("Không tìm thấy đường dẫn video.");
        setMedia((previous) => ({ ...previous, video }));
        setMediaLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setMediaLoading(false);
        setMediaError(
          "Không thể tải video lúc này. Vui lòng thử lại sau hoặc chọn tập khác.",
        );
      });

    void Promise.allSettled([
      mediaGateway.resolve(movie.poster),
      mediaGateway.resolve(movie.subtitle),
      mediaGateway.resolve(currentEpisodeAudio),
    ]).then(([poster, subtitle, audio]) => {
      if (!active) return;
      setMedia((previous) => ({
        ...previous,
        poster: poster.status === "fulfilled" ? poster.value : undefined,
        subtitle: subtitle.status === "fulfilled" ? subtitle.value : undefined,
        audio: audio.status === "fulfilled" ? audio.value : undefined,
      }));
    });

    return () => {
      active = false;
    };
  }, [
    episode,
    currentEpisodeVideo,
    currentEpisodeAudio,
    movie.poster,
    movie.subtitle,
    showTrailer,
  ]);

  const playbackVideo = media.source === currentEpisodeVideo ? media.video : "";
  const isMediaLoading =
    mediaLoading ||
    (Boolean(currentEpisodeVideo) && media.source !== currentEpisodeVideo);

  const handlePlaybackError = () => {
    if (!currentEpisodeVideo) return;
    const sourceKey = `${movie.id}:${currentEpisodeVideo}`;
    const message =
      "Video không thể phát. Vui lòng kiểm tra kết nối hoặc định dạng tệp.";

    if (
      !currentEpisodeVideo.startsWith("movies/") ||
      refreshedMediaRef.current.has(sourceKey)
    ) {
      setMediaError(message);
      return;
    }

    refreshedMediaRef.current.add(sourceKey);
    setMediaError("Đang làm mới liên kết video…");
    void mediaGateway
      .resolve(currentEpisodeVideo, { forceRefresh: true })
      .then((video) => {
        if (activeMediaSourceRef.current !== currentEpisodeVideo) return;
        if (!video) throw new Error(message);
        setMedia((previous) =>
          previous.source === currentEpisodeVideo
            ? { ...previous, video }
            : previous,
        );
        setMediaError("");
      })
      .catch(() => {
        if (activeMediaSourceRef.current === currentEpisodeVideo) {
          setMediaError(message);
        }
      });
  };

  const selectEpisode = (ep: number) => {
    setEpisode(ep);
    onWatch(movie, ep);
    const identifier = movie.slug || movie.id;
    if (typeof window !== "undefined") {
      if (movie.totalEpisodes > 1) {
        window.history.replaceState(null, "", `/xem/${identifier}?tap=${ep}`);
      } else {
        window.history.replaceState(null, "", `/xem/${identifier}`);
      }
    }
  };

  // Reverse list: from newest episode down to 1 (or configured episodes)
  const episodesList =
    movie.episodes && movie.episodes.length > 0
      ? movie.episodes.map((e) => e.episode).sort((a, b) => b - a)
      : Array.from(
          { length: Math.max(1, movie.episode) },
          (_, i) => movie.episode - i,
        );

  const currEpObj = movie.episodes?.find((e) => e.episode === episode);
  const epLabel = showTrailer
    ? "🎬 Trailer"
    : isSingle
      ? "Bản Full (Thuyết minh)"
      : currEpObj?.title?.trim() || `Tập ${episode}`;

  const selectTrailer = () => {
    setShowTrailer(true);
    const identifier = movie.slug || movie.id;
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/xem/${identifier}?trailer=1`);
    }
  };

  const toggleTheaterMode = () => {
    setIsExpanded((current) => !current);

    // Sau khi đổi bố cục, đưa khung xem về đúng đầu màn hình. Nếu không,
    // trình duyệt mobile giữ vị trí cuộn cũ và làm video nằm khuất dưới header.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        playerColumnRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  };

  const recordQualifiedView = (currentTime: number) => {
    const playbackKey = showTrailer ? "trailer" : `episode-${episode}`;
    const progress = watchProgressRef.current;

    if (progress.playbackKey !== playbackKey) {
      progress.playbackKey = playbackKey;
      progress.lastVideoTime = currentTime;
      progress.watchedSeconds = 0;
      return;
    }

    const playedDelta = currentTime - progress.lastVideoTime;
    progress.lastVideoTime = currentTime;

    // timeupdate thường cách nhau dưới 1 giây. Bỏ qua bước nhảy lớn hoặc âm
    // vì đó là thao tác tua, không phải thời gian người dùng thực sự đã xem.
    if (playedDelta > 0 && playedDelta <= 2) {
      progress.watchedSeconds += playedDelta;
    }

    // Count only real playback, but do not make viewers wait 10–30 seconds.
    if (progress.watchedSeconds < 1) return;

    if (reportedViewsRef.current.has(playbackKey)) return;
    if (Date.now() < (viewRetryAtRef.current.get(playbackKey) ?? 0)) return;

    reportedViewsRef.current.add(playbackKey);
    void onView(movie, episode, playbackKey).catch(() => {
      reportedViewsRef.current.delete(playbackKey);
      viewRetryAtRef.current.set(playbackKey, Date.now() + 60_000);
    });
  };

  const reportPlaybackProgress = (
    currentTime: number,
    duration: number,
    force = false,
  ) => {
    if (showTrailer || !Number.isFinite(duration) || duration <= 0) return;
    const key = `${movie.id}:${episode}`;
    const last = lastProgressReportRef.current;
    if (!force && last.key === key && Math.abs(currentTime - last.seconds) < 15)
      return;
    lastProgressReportRef.current = { key, seconds: currentTime };
    onProgress(movie, episode, currentTime, duration);
  };

  return (
    <main
      className={`watch-page-container ${isExpanded ? "theater-mode" : ""}`}
    >
      {/* 1. BREADCRUMBS */}
      <nav className="watch-crumbs" aria-label="Breadcrumb">
        <button type="button" onClick={() => go("/")}>
          Trang chủ
        </button>
        <span className="crumb-sep">/</span>
        <button
          type="button"
          onClick={() => go(`/phim/${movie.slug || movie.id}`)}
        >
          {movie.title}
        </button>
        <span className="crumb-sep">/</span>
        <span className="crumb-current">{epLabel}</span>
      </nav>

      {/* 2. BỐ CỤC 3 CỘT (CHÍNH XÁC THEO HÌNH 1, 100% DỮ LIỆU THẬT) */}
      <div className="watch-main-columns">
        {/* CỘT 1 (TRÁI): BỘ CHỌN TẬP */}
        <aside className="watch-col-episodes">
          <div className="episodes-header">
            <Film size={15} />
            <span>Danh sách tập</span>
          </div>

          <div className="episode-btn-grid">
            {/* NÚT TRAILER (nếu có) */}
            {trailerVideo && (
              <button
                type="button"
                className={`ep-pill-btn ep-pill-trailer ${showTrailer ? "active" : ""}`}
                onClick={selectTrailer}
                title="Xem Trailer phim"
                style={{ gridColumn: "1 / -1" }}
              >
                🎬 Trailer
              </button>
            )}

            {/* Phim Sắp chiếu: không cho chọn tập */}
            {movie.status === "Sắp chiếu" ? (
              <div className="ep-upcoming-notice">
                <span>📅 Sắp phát hành {movie.year}</span>
                {trailerVideo && <small>Nhấn Trailer để xem trước</small>}
              </div>
            ) : isSingle ? (
              <button
                type="button"
                className={`ep-pill-btn ep-pill-full ${!showTrailer ? "active" : ""}`}
                onClick={() => {
                  setShowTrailer(false);
                  selectEpisode(1);
                }}
              >
                Bản Full (Thuyết minh)
              </button>
            ) : (
              episodesList.map((ep) => {
                const epObj = movie.episodes?.find((e) => e.episode === ep);
                const hasVideo = Boolean(
                  epObj?.video || (ep === 1 && movie.video),
                );
                const epName = epObj?.title?.trim() || `Tập ${ep}`;
                const shortLabel = epObj?.title
                  ? epObj.title.replace(/^Tập\s+/i, "")
                  : `${ep}`;
                return (
                  <button
                    type="button"
                    key={ep}
                    className={`ep-pill-btn ${!showTrailer && ep === episode ? "active" : ""} ${hasVideo ? "" : "ep-pill-pending"}`}
                    onClick={() => {
                      setShowTrailer(false);
                      selectEpisode(ep);
                    }}
                    title={hasVideo ? epName : `${epName} (Chờ cập nhật video)`}
                  >
                    {shortLabel}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* CỘT 2 (GIỮA): KHUNG VIDEO & THANH CHỨC NĂNG */}
        <section ref={playerColumnRef} className="watch-col-player">
          <div className="player-viewport">
            {playbackVideo ? (
              <CustomPlayer
                key={`player-${movie.id}-${episode}-${playbackVideo}`}
                src={playbackVideo}
                poster={media.poster || undefined}
                subtitle={media.subtitle || undefined}
                audio={media.audio || undefined}
                title={movie.title}
                episodeLabel={epLabel}
                quality={movie.quality}
                movieId={movie.id}
                episodeNumber={episode}
                initialResumeSeconds={
                  historyItem?.episode === episode && historyItem.progress < 95
                    ? (historyItem.positionSeconds ?? 0)
                    : 0
                }
                persistLocalProgress={
                  apiMode === "mock" || user?.role !== "user"
                }
                onTimeUpdate={(currentTime, duration) => {
                  recordQualifiedView(currentTime);
                  reportPlaybackProgress(currentTime, duration);
                }}
                onPlaybackPause={(currentTime, duration) =>
                  reportPlaybackProgress(currentTime, duration, true)
                }
                onError={handlePlaybackError}
                onEnded={() => {
                  if (!isSingle && episode < movie.totalEpisodes) {
                    selectEpisode(episode + 1);
                  }
                }}
              />
            ) : isMediaLoading ? (
              <div className="player-empty-episode" role="status">
                <Film size={44} />
                <h3>Đang chuẩn bị video…</h3>
                <p>
                  Liên kết phát đang được tải. Video sẽ xuất hiện ngay khi sẵn
                  sàng.
                </p>
              </div>
            ) : movie.status === "Sắp chiếu" ? (
              <div className="player-empty-episode">
                <Film size={44} />
                <h3>📅 Phim sắp phát hành</h3>
                <p>
                  <b>{movie.title}</b> dự kiến ra mắt năm {movie.year}.<br />
                  {trailerVideo
                    ? "Nhấn nút Trailer ở danh sách bên trái để xem trước!"
                    : "Nhấn Yêu thích để nhận thông báo khi phim lên sóng."}
                </p>
              </div>
            ) : (
              <div className="player-empty-episode">
                <Film size={44} />
                <h3>Tập {episode} đang được cập nhật</h3>
                <p>
                  Video cho tập này đang được đội ngũ chuẩn bị. Vui lòng chọn
                  tập khác trong danh sách hoặc quay lại sau.
                </p>
              </div>
            )}
            {mediaError && <p className="player-error">{mediaError}</p>}
          </div>

          {/* THANH ĐIỀU HƯỚNG DƯỚI VIDEO (MỞ RỘNG, TẬP TRƯỚC/TIẾP) */}
          <div className="player-actions-bar">
            <div className="actions-left">
              <button
                type="button"
                className="action-btn"
                onClick={toggleTheaterMode}
                aria-pressed={isExpanded}
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                {isExpanded ? "Thu nhỏ" : "Mở rộng"}
              </button>
            </div>

            <div className="actions-right">
              {!isSingle && (
                <>
                  <button
                    type="button"
                    className="nav-ep-btn"
                    disabled={episode <= 1}
                    onClick={() => selectEpisode(Math.max(1, episode - 1))}
                  >
                    <ChevronLeft size={14} /> Tập Trước
                  </button>
                  <button
                    type="button"
                    className="nav-ep-btn"
                    disabled={episode >= movie.totalEpisodes}
                    onClick={() =>
                      selectEpisode(Math.min(movie.totalEpisodes, episode + 1))
                    }
                  >
                    Tập Tiếp <ChevronRight size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* CỘT 3 (PHẢI): SIDEBAR THÔNG TIN PHIM THẬT */}
        <aside className="watch-col-sidebar">
          <h1 className="sidebar-movie-heading">
            {movie.title} {isSingle ? "" : `| Tập ${episode}`}
          </h1>

          <div className="sidebar-schedule-text">
            Lịch chiếu: <span>{movie.updateDay || "Trọn bộ"}</span>
          </div>

          {/* NÚT THÊM YÊU THÍCH HOẠT ĐỘNG THẬT */}
          <button
            type="button"
            className={`sidebar-fav-btn ${favorite ? "favorited" : ""}`}
            onClick={() => toggleFavorite?.(movie.id)}
          >
            {favorite ? (
              <>
                <Check size={16} /> Đã có trong Phim Yêu Thích
              </>
            ) : (
              <>
                <Plus size={16} /> Thêm vào Phim Yêu Thích
              </>
            )}
          </button>

          {/* THÔNG SỐ CHI TIẾT THẬT */}
          <div className="sidebar-details-grid">
            <div className="detail-row">
              <span className="detail-label">Thời lượng:</span>
              <span className="detail-val">
                {isSingle
                  ? `${movie.duration} phút [${movie.quality}]`
                  : `${epLabel}/${movie.totalEpisodes} (${movie.duration} phút) [${movie.quality}]`}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Trạng thái:</span>
              <span className="detail-val">{movie.status}</span>
            </div>
            <div className="detail-row genres-row">
              <span className="detail-label">Thể loại:</span>
              <div className="detail-pills">
                {movie.genres.map((g) => (
                  <span key={g} className="genre-tag">
                    {g}
                  </span>
                ))}
              </div>
            </div>
            <div className="detail-row">
              <span className="detail-label">Năm:</span>
              <span className="detail-val">{movie.year}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Studio:</span>
              <span className="detail-val">{movie.studio}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Đạo diễn:</span>
              <span className="detail-val">{movie.director}</span>
            </div>
          </div>

          {/* MÔ TẢ PHIM THẬT */}
          <div className="sidebar-desc-wrap">
            <p className={expandedDesc ? "desc-full" : "desc-clamped"}>
              {movie.description}
            </p>
            {movie.description.length > 120 && (
              <button
                type="button"
                className="desc-toggle-btn"
                onClick={() => setExpandedDesc(!expandedDesc)}
              >
                {expandedDesc ? "- Thu gọn" : "+ Xem thêm"}
              </button>
            )}
          </div>
        </aside>
      </div>
      <MovieComments movieId={movie.id} user={user} go={go} />
    </main>
  );
}
