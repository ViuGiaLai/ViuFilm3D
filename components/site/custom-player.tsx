"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  type MouseEvent,
  type TouchEvent,
} from "react";
import {
  Check,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";

export interface PlayerRef {
  play: () => Promise<void> | void;
  pause: () => void;
  seek: (time: number) => void;
  setSpeed: (speed: number) => void;
  getCurrentTime?: () => number;
  isPaused?: () => boolean;
}

type TrackInfo = { label: string; url: string; lang?: string };

type CustomPlayerProps = {
  src: string;
  poster?: string;
  subtitles?: TrackInfo[];
  audios?: TrackInfo[];
  title: string;
  episodeLabel: string;
  quality?: string;
  movieId: number;
  episodeNumber: number;
  onPlay?: (currentTime: number) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlaybackPause?: (currentTime: number, duration: number) => void;
  initialResumeSeconds?: number;
  persistLocalProgress?: boolean;
  onError?: () => void;
  onEnded?: () => void;
  onSeek?: (time: number) => void;
  onChangeSpeed?: (speed: number) => void;
  readOnly?: boolean;
  onUnauthorizedAction?: () => void;
};

// SVG Rewind 10s (khớp chính xác hình 3)
function Rewind10Icon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4v7" />
      <path d="M4 11a9 9 0 1 1 2.5 6.36" />
      <text
        x="12"
        y="15.5"
        fill="currentColor"
        stroke="none"
        fontSize="7.5"
        fontWeight="800"
        textAnchor="middle"
      >
        10
      </text>
    </svg>
  );
}

// SVG Forward 10s (khớp chính xác hình 3)
function Forward10Icon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 4h7v7" />
      <path d="M20 11a9 9 0 1 0-2.5 6.36" />
      <text
        x="12"
        y="15.5"
        fill="currentColor"
        stroke="none"
        fontSize="7.5"
        fontWeight="800"
        textAnchor="middle"
      >
        10
      </text>
    </svg>
  );
}

// Định dạng thời gian Việt hóa cho Modal Thông Báo: "13 phút 36 giây"
function formatVietnameseDuration(totalSeconds: number): string {
  const sec = Math.floor(totalSeconds);
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  if (hours > 0) {
    return `${hours} giờ ${minutes} phút ${seconds} giây`;
  }
  return `${minutes} phút ${seconds} giây`;
}

// Định dạng thời gian cho timeline player: "13:43 / 16:17"
function formatTime(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00";
  const sec = Math.floor(totalSeconds);
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const CustomPlayer = forwardRef<PlayerRef, CustomPlayerProps>(({
  src,
  poster,
  subtitles = [],
  audios = [],
  quality = "Full HD",
  movieId,
  episodeNumber,
  onPlay,
  onTimeUpdate,
  onPlaybackPause,
  initialResumeSeconds = 0,
  persistLocalProgress = true,
  onError,
  onEnded,
  onSeek,
  onChangeSpeed,
  readOnly = false,
  onUnauthorizedAction,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  const lastProgressSaveRef = useRef(0);

  // Trạng thái phát
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [audioTrack, setAudioTrack] = useState<number>(-1); // -1 is original, >= 0 is external audio index
  const [subtitleTrack, setSubtitleTrack] = useState<number>(subtitles.length > 0 ? 0 : -1);
  const [externalAudioError, setExternalAudioError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [needsUnmute, setNeedsUnmute] = useState(false);

  // Trạng thái Double Tap trên mobile (YouTube/Netflix gesture)
  const [touchFeedback, setTouchFeedback] = useState<{
    side: "left" | "right" | null;
    key: number;
  }>({ side: null, key: 0 });
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });

  // Modal thông báo xem tiếp (Hình 1)
  const [resumePrompt, setResumePrompt] = useState<{
    show: boolean;
    seconds: number;
  }>({ show: false, seconds: 0 });

  // Key lưu trữ tiến độ xem
  const storageKey = `viufilm3d-resume-${movieId}-${episodeNumber}`;

  // Kiểm tra lịch sử xem để hiện Modal "THÔNG BÁO! Bạn đã dừng lại ở..."
  useEffect(() => {
    let seconds = Number.isFinite(initialResumeSeconds)
      ? Math.max(0, initialResumeSeconds)
      : 0;
    if (persistLocalProgress) {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const data = JSON.parse(raw);
          if (
            typeof data.seconds === "number" &&
            Number.isFinite(data.seconds)
          ) {
            seconds = Math.max(seconds, data.seconds);
          }
        }
      } catch {
        // Ignored
      }
    }
    if (seconds >= 10) setResumePrompt({ show: true, seconds });
    // The resume prompt is computed once per mounted movie/episode player.
    // Later progress updates must not reopen it while the video is playing.
  }, [storageKey, persistLocalProgress]);

  // Lưu tiến độ xem vào LocalStorage
  const saveProgress = useCallback(
    (time: number, totalDur: number, force = false) => {
      if (
        persistLocalProgress &&
        time >= 5 &&
        totalDur > 10 &&
        (force || Math.abs(time - lastProgressSaveRef.current) >= 5)
      ) {
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              seconds: Math.floor(time),
              duration: Math.floor(totalDur),
              updatedAt: Date.now(),
            }),
          );
          lastProgressSaveRef.current = time;
        } catch {
          // Ignored
        }
      }
    },
    [storageKey, persistLocalProgress],
  );

  // Cờ nhận diện thiết bị cảm ứng vs chuột máy tính
  const isTouchRef = useRef(false);

  // Hiệu ứng icon Play / Pause nhấp nháy khi bấm vào màn hình
  const [clickFeedback, setClickFeedback] = useState<{
    type: "play" | "pause" | null;
    key: number;
  }>({ type: null, key: 0 });

  const useExternalAudio =
    audioTrack >= 0 && audios.length > audioTrack && !externalAudioError;

  const syncExternalAudio = (force = false) => {
    const video = videoRef.current;
    const external = audioRef.current;
    if (!video || !external || !useExternalAudio) return;

    if (!force && (video.seeking || external.paused)) return;
    if (force || Math.abs(external.currentTime - video.currentTime) > 0.75) {
      external.currentTime = video.currentTime;
    }
    external.playbackRate = video.playbackRate;
    external.volume = volume;
    external.muted = isMuted;
  };

  const playExternalAudio = () => {
    const external = audioRef.current;
    if (!external || !useExternalAudio) return;
    syncExternalAudio(true);
    void external.play().catch(() => {
      setExternalAudioError(true);
      setAudioTrack(-1);
      if (videoRef.current) videoRef.current.muted = isMuted;
    });
  };

  const selectAudioTrack = (trackIndex: number) => {
    const video = videoRef.current;
    const external = audioRef.current;
    if (!video) return;

    if (trackIndex >= 0 && audios.length > trackIndex && !externalAudioError) {
      setAudioTrack(trackIndex);
      video.muted = true;
      if (external) {
        external.currentTime = video.currentTime;
        external.playbackRate = video.playbackRate;
        external.volume = volume;
        external.muted = isMuted;
        if (!video.paused) {
          void external.play().catch(() => {
            setExternalAudioError(true);
            setAudioTrack(-1);
            video.muted = isMuted;
          });
        }
      }
    } else {
      setAudioTrack(-1);
      external?.pause();
      video.muted = isMuted;
    }
  };

  const validateExternalAudioDuration = () => {
    const video = videoRef.current;
    const external = audioRef.current;
    if (
      !video ||
      !external ||
      !Number.isFinite(video.duration) ||
      !Number.isFinite(external.duration) ||
      video.duration <= 0 ||
      external.duration <= 0
    ) {
      return;
    }

    if (Math.abs(video.duration - external.duration) > 3) {
      external.pause();
      setExternalAudioError(true);
      setAudioTrack(-1);
      video.muted = isMuted;
    }
  };

  useEffect(() => {
    setAudioTrack(-1);
    setSubtitleTrack(subtitles.length > 0 ? 0 : -1);
    setExternalAudioError(false);
    audioRef.current?.pause();
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [src, audios, subtitles]);

  // Toggle Play / Pause
  const togglePlay = () => {
    if (readOnly) {
      if (onUnauthorizedAction) onUnauthorizedAction();
      return;
    }
    if (!videoRef.current) return;
    if (resumePrompt.show) {
      setResumePrompt((prev) => ({ ...prev, show: false }));
    }
    const isPaused = videoRef.current.paused;
    if (isPaused) {
      void videoRef.current.play().catch(() => {
        setIsPlaying(false);
        setShowControls(true);
      });
      setClickFeedback({ type: "play", key: Date.now() });
    } else {
      videoRef.current.pause();
      audioRef.current?.pause();
      setIsPlaying(false);
      setShowControls(true);
      setClickFeedback({ type: "pause", key: Date.now() });
      if (videoRef.current) {
        onPlaybackPause?.(videoRef.current.currentTime, videoRef.current.duration);
      }
    }
    setTimeout(() => {
      setClickFeedback((prev) => ({ ...prev, type: null }));
    }, 700);
  };

  // Nhấp chuột vào màn hình video để Dừng / Phát
  const handleScreenClick = () => {
    // Nếu là cảm ứng trên điện thoại vừa kích hoạt thì bỏ qua synthesized click
    if (isTouchRef.current) {
      isTouchRef.current = false;
      return;
    }
    if (needsUnmute) {
      if (videoRef.current) videoRef.current.muted = false;
      if (audioRef.current) audioRef.current.muted = false;
      setIsMuted(false);
      setNeedsUnmute(false);
    }
    togglePlay();
    resetControlsTimer();
  };

  // Nút 1 trong Modal: Tiếp tục xem từ giây đã dừng
  const handleResumeContinue = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = resumePrompt.seconds;
    if (audioRef.current) audioRef.current.currentTime = resumePrompt.seconds;
    setResumePrompt({ show: false, seconds: 0 });
    void videoRef.current.play().catch(() => setShowControls(true));
  };

  // Nút 2 trong Modal: Xem lại từ đầu
  const handleResumeRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    if (audioRef.current) audioRef.current.currentTime = 0;
    setResumePrompt({ show: false, seconds: 0 });
    void videoRef.current.play().catch(() => setShowControls(true));
  };

  // Tua 10 giây trước / sau (Hình 3)
  const handleRewind10 = () => {
    if (!videoRef.current) return;
    const target = Math.max(0, videoRef.current.currentTime - 10);
    videoRef.current.currentTime = target;
    syncExternalAudio(true);
    onSeek?.(target);
  };

  const handleForward10 = () => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(videoRef.current.duration || duration, videoRef.current.currentTime + 10));
    videoRef.current.currentTime = target;
    syncExternalAudio(true);
    onSeek?.(target);
  };

  // Âm lượng & Mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = useExternalAudio ? true : nextMuted;
    if (audioRef.current) audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (newVol: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVol;
    if (audioRef.current) audioRef.current.volume = newVol;
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      videoRef.current.muted = useExternalAudio;
      if (audioRef.current) audioRef.current.muted = false;
      setIsMuted(false);
    }
  };

  // Thay đổi tốc độ phát
  const handleSpeedChange = (speed: number) => {
    if (readOnly) {
      if (onUnauthorizedAction) onUnauthorizedAction();
      return;
    }
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    if (audioRef.current) audioRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSettings(false);
    onChangeSpeed?.(speed);
  };

  // Picture-in-Picture
  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {
      // Ignored
    }
  };

  // Fullscreen (hỗ trợ cả iPhone / iPad Safari qua webkitEnterFullscreen)
  const toggleFullscreen = async () => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    try {
      const iosVideo = video as HTMLVideoElement & {
        webkitEnterFullscreen?: () => void;
      };
      if (
        typeof iosVideo.webkitEnterFullscreen === "function" &&
        !document.fullscreenElement
      ) {
        iosVideo.webkitEnterFullscreen();
        return;
      }

      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, []);

  // Phím tắt bàn phím (Space: Play/Pause, Trái/Phải: Tua, F: Toàn màn hình, M: Mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(activeEl.tagName)
      ) {
        return;
      }
      if (e.key === " " || e.key === "k" || e.key === "K") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft" || e.key === "j" || e.key === "J") {
        e.preventDefault();
        handleRewind10();
      } else if (e.key === "ArrowRight" || e.key === "l" || e.key === "L") {
        e.preventDefault();
        handleForward10();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        void toggleFullscreen();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isPlaying,
    isMuted,
    isFullscreen,
    duration,
    useExternalAudio,
    volume,
    resumePrompt.show,
  ]);

  // Xử lý Scrubbing / Seekbar bằng chuột hoặc cảm ứng ngón tay
  const seekToPosition = (clientX: number) => {
    if (!videoRef.current || !progressTrackRef.current) return;
    const rect = progressTrackRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetTime = pos * (duration || videoRef.current.duration || 0);
    videoRef.current.currentTime = targetTime;
    if (audioRef.current && useExternalAudio) {
      audioRef.current.currentTime = targetTime;
    }
    setCurrentTime(targetTime);
    onSeek?.(targetTime);
  };

  const handleSeekMouse = (e: MouseEvent<HTMLDivElement>) => {
    if (readOnly) {
      if (onUnauthorizedAction) onUnauthorizedAction();
      return;
    }
    seekToPosition(e.clientX);
  };

  const handleSeekTouch = (e: TouchEvent<HTMLDivElement>) => {
    if (readOnly) {
      if (onUnauthorizedAction) onUnauthorizedAction();
      return;
    }
    if (e.touches[0]) {
      seekToPosition(e.touches[0].clientX);
    }
  };

  // Reset timer tự ẩn thanh điều khiển
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        if (!showSettings) {
          setShowControls(false);
        }
      }, 3000);
    }
  }, [isPlaying, showSettings]);

  // Cảm ứng chạm trên màn hình Mobile (Single tap = hiện controls, Double tap = tua 10s)
  const handleTouchScreen = (e: TouchEvent<HTMLDivElement>) => {
    const touch = e.changedTouches[0];
    if (!touch || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const width = rect.width;
    const now = Date.now();
    const timeDiff = now - lastTapRef.current.time;
    const distDiff = Math.abs(x - lastTapRef.current.x);

    // Phát hiện chạm đúp (Double tap trong vòng 320ms)
    if (timeDiff < 320 && distDiff < 60) {
      if (x < width * 0.38) {
        // Chạm đúp bên trái: Tua lại 10s
        handleRewind10();
        setTouchFeedback({ side: "left", key: now });
        setTimeout(() => {
          setTouchFeedback((prev) =>
            prev.key === now ? { side: null, key: 0 } : prev,
          );
        }, 800);
      } else if (x > width * 0.62) {
        // Chạm đúp bên phải: Tua tới 10s
        handleForward10();
        setTouchFeedback({ side: "right", key: now });
        setTimeout(() => {
          setTouchFeedback((prev) =>
            prev.key === now ? { side: null, key: 0 } : prev,
          );
        }, 800);
      } else {
        // Chạm đúp ở giữa: Phát / Tạm dừng
        togglePlay();
      }
      lastTapRef.current = { time: 0, x: 0 };
    } else {
      // Chạm 1 lần: Bật/tắt thanh điều khiển
      lastTapRef.current = { time: now, x };
      setShowControls((prev) => !prev);
      resetControlsTimer();
    }
  };

  const handleMouseMove = () => {
    resetControlsTimer();
  };

  const handleMouseLeave = () => {
    if (isPlaying && !showSettings) {
      setShowControls(false);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  useImperativeHandle(ref, () => ({
    play: async () => {
      const v = videoRef.current;
      if (!v) return;
      try {
        await v.play();
        setIsPlaying(true);
      } catch (err: unknown) {
        // Nếu trình duyệt chặn phát có tiếng do người dùng chưa chạm vào trang web:
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          try {
            v.muted = true;
            setIsMuted(true);
            await v.play();
            setIsPlaying(true);
            setNeedsUnmute(true);
            return;
          } catch {
            // Trường hợp hy hữu cả muted cũng bị từ chối
          }
        }
        setIsPlaying(false);
        setShowControls(true);
      }
    },
    pause: () => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        audioRef.current?.pause();
        setIsPlaying(false);
      }
    },
    seek: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        syncExternalAudio(true);
      }
    },
    setSpeed: (speed: number) => {
      if (videoRef.current) {
        videoRef.current.playbackRate = speed;
        if (audioRef.current) audioRef.current.playbackRate = speed;
        setPlaybackSpeed(speed);
      }
    },
    getCurrentTime: () => {
      return videoRef.current?.currentTime ?? 0;
    },
    isPaused: () => {
      return videoRef.current?.paused ?? true;
    },
  }));

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      // Re-apply subtitle track if it changes
      Array.from(video.textTracks).forEach((track, i) => {
        track.mode = i === subtitleTrack ? "showing" : "hidden";
      });
    }
  }, [subtitleTrack]);

  return (
    <div
      ref={containerRef}
      className={`custom-player-wrapper ${isFullscreen ? "is-fullscreen" : ""}`}
      onClick={handleScreenClick}
      onDoubleClick={(e) => {
        e.stopPropagation();
        void toggleFullscreen();
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => {
        isTouchRef.current = true;
      }}
      onTouchEnd={handleTouchScreen}
    >
      <video
        ref={videoRef}
        key={src}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        className="custom-player-video"
        onClick={(e) => {
          e.stopPropagation();
          handleScreenClick();
        }}
        onPlay={() => {
          setIsPlaying(true);
          onPlay?.(videoRef.current?.currentTime ?? 0);
        }}
        onPause={() => {
          audioRef.current?.pause();
          setIsPlaying(false);
          setShowControls(true);
          const video = videoRef.current;
          if (video) {
            saveProgress(video.currentTime, video.duration, true);
            onPlaybackPause?.(video.currentTime, video.duration);
          }
        }}
        onWaiting={() => audioRef.current?.pause()}
        onPlaying={playExternalAudio}
        onError={() => {
          audioRef.current?.pause();
          setIsPlaying(false);
          setShowControls(true);
          onError?.();
        }}
        onSeeking={() => syncExternalAudio(true)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setCurrentTime(v.currentTime);
          syncExternalAudio();
          onTimeUpdate?.(v.currentTime, v.duration || duration);
          saveProgress(v.currentTime, v.duration || duration);

          if (v.buffered.length > 0) {
            setBufferedEnd(v.buffered.end(v.buffered.length - 1));
          }
        }}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          setDuration(v.duration);
          validateExternalAudioDuration();
        }}
        onEnded={() => {
          const video = videoRef.current;
          if (video) onPlaybackPause?.(video.duration, video.duration);
          audioRef.current?.pause();
          setIsPlaying(false);
          setShowControls(true);
          if (persistLocalProgress) {
            try {
              localStorage.removeItem(storageKey);
            } catch {
              // Storage access must not interrupt playback completion.
            }
          }
          onEnded?.();
        }}
      >
        {subtitles.map((sub, idx) => (
          <track
            key={idx}
            kind="subtitles"
            src={sub.url}
            srcLang={sub.lang || "vi"}
            label={sub.label}
            default={idx === subtitleTrack}
          />
        ))}
      </video>
      {audios.length > 0 && audioTrack >= 0 && audios[audioTrack] && (
        <audio
          ref={audioRef}
          src={audios[audioTrack].url}
          preload="metadata"
          className="custom-player-external-audio"
          aria-hidden="true"
          onLoadedMetadata={validateExternalAudioDuration}
          onError={() => {
            setExternalAudioError(true);
            setAudioTrack(-1);
            if (videoRef.current) videoRef.current.muted = isMuted;
          }}
        />
      )}

      {/* HIỆU ỨNG ICON PLAY / PAUSE NHẤP NHÁY KHI BẤM VÀO MÀN HÌNH */}
      {clickFeedback.type && (
        <div key={clickFeedback.key} className="screen-click-feedback">
          {clickFeedback.type === "play" ? (
            <Play size={36} fill="currentColor" />
          ) : (
            <Pause size={36} fill="currentColor" />
          )}
        </div>
      )}

      {/* HIỆU ỨNG RIPPLE CHẠM ĐÚP TUA 10S TRÊN MOBILE (YOUTUBE / NETFLIX STYLE) */}
      {touchFeedback.side === "left" && (
        <div className="double-tap-feedback feedback-left">
          <RotateCcw size={32} />
          <span>-10s</span>
        </div>
      )}
      {touchFeedback.side === "right" && (
        <div className="double-tap-feedback feedback-right">
          <RotateCw size={32} />
          <span>+10s</span>
        </div>
      )}

      {/* NÚT BẬT TIẾNG KHI TỰ ĐỘNG PHÁT TẮT TIẾNG DO BROWSER POLICY */}
      {needsUnmute && (
        <button
          type="button"
          className="player-unmute-prompt-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (videoRef.current) videoRef.current.muted = false;
            if (audioRef.current) audioRef.current.muted = false;
            setIsMuted(false);
            setNeedsUnmute(false);
          }}
        >
          <VolumeX size={18} />
          <span>Bấm để bật âm thanh</span>
        </button>
      )}

      {/* 1. NÚT PLAY TRÒN CHÍNH GIỮA MÀN HÌNH (User: "thiếu nút play nữa") */}
      {!isPlaying && !resumePrompt.show && (
        <button
          type="button"
          className="center-big-play-btn"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          aria-label="Phát video"
        >
          <Play size={38} fill="currentColor" />
        </button>
      )}

      {/* 2. MODAL THÔNG BÁO XEM TIẾP (Chính xác theo Hình 1) */}
      {resumePrompt.show && (
        <div
          className="resume-modal-overlay"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="resume-modal-card">
            <h3 className="resume-modal-title">THÔNG BÁO!</h3>
            <p className="resume-modal-desc">
              Bạn đã dừng lại ở{" "}
              <span className="resume-time-badge">
                {formatVietnameseDuration(resumePrompt.seconds)}
              </span>
            </p>
            <div className="resume-btn-row">
              <button
                type="button"
                className="resume-btn resume-continue-btn"
                onClick={handleResumeContinue}
              >
                Tiếp tục xem
              </button>
              <button
                type="button"
                className="resume-btn resume-restart-btn"
                onClick={handleResumeRestart}
              >
                Xem lại từ đầu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. THANH ĐIỀU KHIỂN ĐẦY ĐỦ CÁC NÚT (Chính xác theo Hình 3) */}
      <div
        className={`custom-player-controls ${
          showControls || !isPlaying ? "visible" : "hidden"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* TIMELINE / THANH TIẾN ĐỘ ĐỎ TRÊN CÙNG CỦA CONTROLS (Hình 3) */}
        <div
          ref={progressTrackRef}
          className="player-timeline-container"
          onClick={handleSeekMouse}
          onTouchStart={handleSeekTouch}
          onTouchMove={handleSeekTouch}
        >
          <div className="player-timeline-bg" />
          <div
            className="player-timeline-buffered"
            style={{ width: `${bufferPercent}%` }}
          />
          <div
            className="player-timeline-played"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="player-timeline-thumb" />
          </div>
        </div>

        {/* CÁC NÚT CHỨC NĂNG DƯỚI TIMELINE */}
        <div className="player-controls-bottom">
          {/* CỤM NÚT BÊN TRÁI: Play/Pause, Tua 10s, Volume, Thời gian */}
          <div className="controls-left">
            {/* Nút Play / Pause */}
            <button
              type="button"
              className="ctrl-btn play-pause-btn"
              onClick={togglePlay}
              title={isPlaying ? "Tạm dừng" : "Phát"}
            >
              {isPlaying ? (
                <Pause size={20} fill="currentColor" />
              ) : (
                <Play size={20} fill="currentColor" />
              )}
            </button>

            {/* Nút Tua lại 10s (Hình 3) */}
            <button
              type="button"
              className="ctrl-btn rewind-btn"
              onClick={handleRewind10}
              title="Tua lại 10 giây"
            >
              <Rewind10Icon size={20} />
            </button>

            {/* Nút Tua tới 10s (Hình 3) */}
            <button
              type="button"
              className="ctrl-btn forward-btn"
              onClick={handleForward10}
              title="Tua tới 10 giây"
            >
              <Forward10Icon size={20} />
            </button>

            {/* Cụm Âm lượng (Icon + Slider khi hover) */}
            <div className="volume-wrapper">
              <button
                type="button"
                className="ctrl-btn volume-btn"
                onClick={toggleMute}
                title={isMuted ? "Bật âm thanh" : "Tắt tiếng"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={20} />
                ) : volume < 0.5 ? (
                  <Volume1 size={20} />
                ) : (
                  <Volume2 size={20} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="volume-slider"
                title={`Âm lượng: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
            </div>

            {/* Hiển thị thời gian dạng 13:43 / 16:17 (Hình 3) */}
            <div className="player-time-display">
              <span className="current-time">{formatTime(currentTime)}</span>
              <span className="time-divider">/</span>
              <span className="total-duration">{formatTime(duration)}</span>
            </div>
          </div>

          {/* CỤM NÚT BÊN PHẢI: Cài đặt (⚙), PiP, Toàn màn hình (⛶) */}
          <div className="controls-right">
            {/* Nút Cài đặt (Bánh răng ⚙) */}
            <div className="settings-wrapper">
              <button
                type="button"
                className={`ctrl-btn settings-btn ${
                  showSettings ? "active" : ""
                }`}
                onClick={() => setShowSettings(!showSettings)}
                title="Cài đặt"
              >
                <Settings size={20} />
              </button>

              {/* Menu cài đặt nổi */}
              {showSettings && (
                <div className="player-settings-menu">
                  <div className="settings-section">
                    <span className="settings-header">Tốc độ phát</span>
                    <div className="speed-options-list">
                      {SPEED_OPTIONS.map((speed) => (
                        <button
                          key={speed}
                          type="button"
                          className={`speed-option-item ${
                            playbackSpeed === speed ? "selected" : ""
                          }`}
                          onClick={() => handleSpeedChange(speed)}
                        >
                          <span>
                            {speed === 1 ? "1.0x (Chuẩn)" : `${speed}x`}
                          </span>
                          {playbackSpeed === speed && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="settings-divider" />
                  {audios.length > 0 && (
                    <>
                      <div className="settings-section">
                        <span className="settings-header">Âm thanh</span>
                        <div className="speed-options-list">
                          <button
                            type="button"
                            className={`speed-option-item ${
                              audioTrack === -1 ? "selected" : ""
                            }`}
                            onClick={() => selectAudioTrack(-1)}
                          >
                            <span>Âm thanh gốc</span>
                            {audioTrack === -1 && <Check size={14} />}
                          </button>
                          {audios.map((a, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className={`speed-option-item ${
                                audioTrack === idx ? "selected" : ""
                              }`}
                              disabled={audioTrack === idx && externalAudioError}
                              onClick={() => selectAudioTrack(idx)}
                            >
                              <span>
                                {audioTrack === idx && externalAudioError
                                  ? "Audio bổ sung bị lỗi"
                                  : a.label}
                              </span>
                              {audioTrack === idx && <Check size={14} />}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="settings-divider" />
                    </>
                  )}
                  {subtitles.length > 0 && (
                    <>
                      <div className="settings-section">
                        <span className="settings-header">Phụ đề</span>
                        <div className="speed-options-list">
                          <button
                            type="button"
                            className={`speed-option-item ${
                              subtitleTrack === -1 ? "selected" : ""
                            }`}
                            onClick={() => setSubtitleTrack(-1)}
                          >
                            <span>Tắt phụ đề</span>
                            {subtitleTrack === -1 && <Check size={14} />}
                          </button>
                          {subtitles.map((sub, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className={`speed-option-item ${
                                subtitleTrack === idx ? "selected" : ""
                              }`}
                              onClick={() => setSubtitleTrack(idx)}
                            >
                              <span>{sub.label}</span>
                              {subtitleTrack === idx && <Check size={14} />}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="settings-divider" />
                    </>
                  )}
                  <div className="settings-section quality-info">
                    <span className="settings-header">Độ phân giải</span>
                    <span className="quality-badge">{quality}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Nút Thu nhỏ / PiP (Hình 3) */}
            <button
              type="button"
              className="ctrl-btn pip-btn"
              onClick={togglePiP}
              title="Hình trong hình (PiP)"
            >
              <PictureInPicture2 size={20} />
            </button>

            {/* Nút Toàn màn hình ⛶ (Hình 3) */}
            <button
              type="button"
              className="ctrl-btn fullscreen-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

CustomPlayer.displayName = "CustomPlayer";
export default CustomPlayer;
