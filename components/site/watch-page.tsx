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
  Users,
} from "lucide-react";
import type { Movie } from "@/lib/movies";
import type { Account, HistoryItem } from "@/lib/app-types";
import MovieComments from "@/components/site/movie-comments";
import type { Navigate, WatchMovie } from "@/components/site/types";
import { mediaGateway } from "@/lib/media-gateway";
import { apiMode } from "@/lib/config";
import CustomPlayer, { type PlayerRef } from "@/components/site/custom-player";
import { joinWatchParty, type WatchPartyEvent } from "@/lib/watch-party-client";
import { UserAvatar } from "@/components/ui/user-avatar";

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
  const roomQuery = searchParams.get("room");
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
  const playerRef = useRef<PlayerRef>(null);
  const watchPartyRef = useRef<{ broadcast: (e: WatchPartyEvent) => void } | null>(null);
  const lastHeartbeatRef = useRef<number>(0);
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
  const [isHost, setIsHost] = useState(false);
  const [viewerCount, setViewerCount] = useState(1);
  const [viewers, setViewers] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: "", show: false });

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  useEffect(() => {
    if (Number.isInteger(parsedTap) && parsedTap > 0) {
      setEpisode(parsedTap);
      setShowTrailer(false);
    }
  }, [parsedTap]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      isSingle &&
      window.location.search.includes("tap=")
    ) {
      const identifier = movie.slug || movie.id;
      window.history.replaceState(null, "", `/xem/${identifier}${roomQuery ? `?room=${roomQuery}` : ""}`);
    }
  }, [isSingle, movie.slug, movie.id, roomQuery]);

  // Watch Party logic
  useEffect(() => {
    const hostKey = localStorage.getItem(`watchparty_host_${roomQuery}`) === "true";
    if (roomQuery) {
      setIsHost(hostKey);
    }

    if (!roomQuery) return;
    
    const wp = joinWatchParty(
      `watchparty:${roomQuery}`,
      (event) => {
        const player = playerRef.current;
        if (!player) return;
        if (event.type === "play") {
          if (typeof event.time === "number" && Number.isFinite(event.time)) {
            const cur = player.getCurrentTime ? player.getCurrentTime() : 0;
            if (Math.abs(cur - event.time) > 0.8) {
              player.seek(event.time);
            }
          }
          void player.play();
        } else if (event.type === "pause") {
          if (typeof event.time === "number" && Number.isFinite(event.time)) {
            player.seek(event.time);
          }
          player.pause();
        } else if (event.type === "seek" && event.time !== undefined) {
          player.seek(event.time);
        } else if (event.type === "change_speed" && event.speed !== undefined) {
          player.setSpeed?.(event.speed);
        } else if (event.type === "change_episode" && event.episode !== undefined) {
          selectEpisode(event.episode, true);
        } else if (event.type === "request_sync") {
          // Khách mới vào phòng yêu cầu Chủ phòng gửi vị trí thời gian hiện tại
          if (hostKey) {
            const cur = player.getCurrentTime ? player.getCurrentTime() : 0;
            const paused = player.isPaused ? player.isPaused() : true;
            wp?.broadcast({
              type: "sync",
              time: cur,
              paused,
              episode,
              by: String(user?.id),
            });
          }
        } else if (event.type === "sync") {
          // Đồng bộ tức thì theo Chủ phòng
          if (!hostKey) {
            if (event.episode !== undefined && event.episode !== episode) {
              selectEpisode(event.episode, true);
            }
            if (typeof event.time === "number" && Number.isFinite(event.time)) {
              player.seek(event.time);
            }
            if (event.paused === false) {
              void player.play();
            } else if (event.paused === true) {
              player.pause();
            }
          }
        } else if (event.type === "heartbeat") {
          // Bù trôi thời gian định kỳ giữa Chủ phòng và Khách
          if (!hostKey && typeof event.time === "number" && Number.isFinite(event.time)) {
            const cur = player.getCurrentTime ? player.getCurrentTime() : 0;
            if (Math.abs(cur - event.time) > 2.5) {
              player.seek(event.time);
            }
          }
        }
      },
      (count, viewersList) => {
        setViewerCount(count);
        setViewers(viewersList);
        // Khi có thành viên mới vào phòng, Chủ phòng chủ động phát 1 gói sync
        if (hostKey && playerRef.current) {
          const cur = playerRef.current.getCurrentTime ? playerRef.current.getCurrentTime() : 0;
          const paused = playerRef.current.isPaused ? playerRef.current.isPaused() : true;
          wp?.broadcast({
            type: "sync",
            time: cur,
            paused,
            episode,
            by: String(user?.id),
          });
        }
      },
      {
        id: user?.id ? String(user.id) : undefined,
        name: user?.name || "Khách",
        avatarId: user?.avatarId,
        avatarVersion: user?.avatarVersion,
        avatarFrameId: user?.avatarFrameId,
        isHost: hostKey
      } as any
    );

    if (wp) {
      watchPartyRef.current = { broadcast: wp.broadcast };
      // Nếu là khách tham gia phòng, gửi yêu cầu đồng bộ ngay sau khi kết nối
      if (!hostKey) {
        setTimeout(() => {
          wp.broadcast({ type: "request_sync", by: String(user?.id) });
        }, 500);
      }
    }

    return () => {
      if (wp) wp.leave();
      watchPartyRef.current = null;
    };
  }, [roomQuery, user, episode]);

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



  const [media, setMedia] = useState<{
    source: string;
    video: string;
    poster?: string;
    subtitles?: Array<{ label: string; lang?: string; url: string }>;
    audios?: Array<{ label: string; url: string }>;
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

    const loadMedia = async () => {
      const posterPromise = mediaGateway.resolve(movie.poster);
      const subsPromises = (movie.subtitles || []).map(async (s) => ({ 
        ...s, 
        url: await mediaGateway.resolve(s.url).catch(() => undefined) || s.url 
      }));
      const audiosPromises = (movie.audios || []).map(async (a) => ({ 
        ...a, 
        url: await mediaGateway.resolve(a.url).catch(() => undefined) || a.url 
      }));
      
      const [poster, subs, audios] = await Promise.all([
        posterPromise.catch(() => undefined),
        Promise.all(subsPromises),
        Promise.all(audiosPromises),
      ]);
      
      if (!active) return;
      setMedia((previous) => ({
        ...previous,
        poster,
        subtitles: subs,
        audios: audios,
      }));
    };
    
    void loadMedia();

    return () => {
      active = false;
    };
  }, [
    episode,
    currentEpisodeVideo,
    movie.poster,
    movie.subtitles,
    movie.audios,
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

  const selectEpisode = (ep: number, forceSync = false) => {
    if (roomQuery && !isHost && !forceSync) {
      showToast("Chỉ Chủ phòng mới có quyền chuyển tập!");
      return;
    }
    setEpisode(ep);
    onWatch(movie, ep);
    if (roomQuery && isHost && !forceSync) {
      watchPartyRef.current?.broadcast({ type: "change_episode", episode: ep, by: String(user?.id) } as any);
    }
    const identifier = movie.slug || movie.id;
    if (typeof window !== "undefined") {
      if (movie.totalEpisodes > 1) {
        window.history.replaceState(null, "", `/xem/${identifier}?tap=${ep}${roomQuery ? `&room=${roomQuery}` : ""}`);
      } else {
        window.history.replaceState(null, "", `/xem/${identifier}${roomQuery ? `?room=${roomQuery}` : ""}`);
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
      window.history.replaceState(null, "", `/xem/${identifier}?trailer=1${roomQuery ? `&room=${roomQuery}` : ""}`);
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
                ref={playerRef}
                src={playbackVideo}
                poster={media.poster || undefined}
                subtitles={media.subtitles || undefined}
                audios={media.audios || undefined}
                title={movie.title}
                episodeLabel={epLabel}
                quality={movie.quality}
                movieId={movie.id}
                episodeNumber={episode}
                initialResumeSeconds={
                  Boolean(roomQuery) && !isHost
                    ? 0
                    : historyItem?.episode === episode && historyItem.progress < 95
                      ? (historyItem.positionSeconds ?? 0)
                      : 0
                }
                persistLocalProgress={
                  Boolean(roomQuery) && !isHost
                    ? false
                    : apiMode === "mock" || user?.role !== "user"
                }
                readOnly={Boolean(roomQuery) && !isHost}
                onUnauthorizedAction={() => showToast("Chỉ Chủ phòng mới có quyền điều khiển video!")}
                onPlay={(currentTime) => {
                  if (!roomQuery || isHost) {
                    watchPartyRef.current?.broadcast({ type: "play", time: currentTime, by: String(user?.id) });
                  }
                }}
                onTimeUpdate={(currentTime, duration) => {
                  recordQualifiedView(currentTime);
                  reportPlaybackProgress(currentTime, duration);
                  if (roomQuery && isHost) {
                    const now = Date.now();
                    if (now - lastHeartbeatRef.current > 8000) {
                      lastHeartbeatRef.current = now;
                      watchPartyRef.current?.broadcast({
                        type: "heartbeat",
                        time: currentTime,
                        by: String(user?.id),
                      });
                    }
                  }
                }}
                onPlaybackPause={(currentTime, duration) => {
                  if (!roomQuery || isHost) {
                    watchPartyRef.current?.broadcast({ type: "pause", time: currentTime, by: String(user?.id) });
                  }
                  reportPlaybackProgress(currentTime, duration, true);
                }}
                onSeek={(time) => {
                  if (!roomQuery || isHost) {
                    watchPartyRef.current?.broadcast({ type: "seek", time, by: String(user?.id) });
                  }
                }}
                onChangeSpeed={(speed) => {
                  if (!roomQuery || isHost) {
                    watchPartyRef.current?.broadcast({ type: "change_speed", speed, by: String(user?.id) } as any);
                  }
                }}
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
              <button
                type="button"
                className="action-btn"
                style={{ marginLeft: 8 }}
                onClick={() => {
                  if (roomQuery) {
                    navigator.clipboard.writeText(window.location.href).then(() => {
                      showToast("✅ Đã sao chép link Phòng Xem Chung vào khay nhớ tạm! Bạn có thể gửi cho bạn bè ngay.");
                    });
                  } else {
                    const roomCode = Math.random().toString(36).substring(2, 10);
                    const url = new URL(window.location.href);
                    url.searchParams.set("room", roomCode);
                    localStorage.setItem(`watchparty_host_${roomCode}`, "true");
                    navigator.clipboard.writeText(url.toString()).then(() => {
                      showToast("✅ Đã sao chép link Phòng Xem Chung vào khay nhớ tạm! Bạn có thể gửi cho bạn bè ngay.");
                      window.history.pushState(null, "", url.toString());
                      setTimeout(() => {
                        window.location.href = url.toString();
                      }, 2000);
                    });
                  }
                }}
              >
                <Users size={14} /> {roomQuery ? "Copy Link mời" : "Xem chung"}
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
          {roomQuery && (
            <div style={{ background: "rgba(124,58,237,0.1)", border: "1px solid #7c3aed", padding: 12, borderRadius: 8, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <strong style={{ color: "#c4b5fd" }}>Phòng xem chung</strong>
                <span style={{ fontSize: 12, background: "#7c3aed", color: "#fff", padding: "2px 8px", borderRadius: 12 }}>
                  <Users size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                  {viewerCount}
                </span>
              </div>
              {isHost ? (
                <p style={{ fontSize: 13, margin: 0, color: "#a78bfa" }}>
                  <b style={{ color: "#fff" }}>Bạn là Chủ phòng.</b> Hãy phát, tạm dừng hoặc tua để đồng bộ video cho mọi người.
                </p>
              ) : (
                <p style={{ fontSize: 13, margin: 0, color: "#a78bfa" }}>
                  Đang đồng bộ video với chủ phòng. Bạn chỉ có quyền xem.
                </p>
              )}
              {viewers && viewers.length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(124,58,237,0.3)" }}>
                  <div style={{ fontSize: 12, color: "#a78bfa", marginBottom: 8 }}>Người đang xem:</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {viewers.map((v, idx) => (
                      <div key={idx} style={{ background: "rgba(255,255,255,0.1)", padding: "4px 12px 4px 6px", borderRadius: 20, fontSize: 13, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ transform: 'scale(0.8)', transformOrigin: 'center', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <UserAvatar 
                            name={v.name} 
                            avatarId={v.avatarId} 
                            avatarVersion={v.avatarVersion} 
                            frameId={v.avatarFrameId} 
                            size="small" 
                            userId={v.id && v.id !== "undefined" ? Number(v.id) : undefined}
                          />
                        </div>
                        <span style={{ fontWeight: 500 }}>
                          {v.name} {v.isHost ? <span style={{ color: '#a78bfa', fontSize: 11 }}> (Chủ)</span> : ""} {v.id === String(user?.id) ? <span style={{ opacity: 0.7, fontSize: 11 }}> (Bạn)</span> : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
      <MovieComments movieId={movie.id} currentEpisodeIndex={episode} user={user} go={go} />

      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #7c3aed',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(124,58,237,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          maxWidth: 320,
          animation: 'toast-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          lineHeight: 1.5,
          fontSize: 14
        }}>
          <div style={{ background: 'rgba(124,58,237,0.2)', padding: 6, borderRadius: '50%', color: '#a78bfa' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#c4b5fd', marginBottom: 4 }}>THÔNG BÁO</div>
            <div style={{ color: '#e5e7eb' }}>{toast.message}</div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes toast-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}} />
    </main>
  );
}
