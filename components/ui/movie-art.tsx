"use client";

import { useEffect, useState } from "react";
import { Film } from "lucide-react";
import type { Movie } from "@/lib/movies";
import { mediaGateway } from "@/lib/media-gateway";

type MovieArtProps = {
  movie: Movie;
  className?: string;
  disableVideoThumb?: boolean;
};

export function MovieArt({
  movie,
  className = "",
  disableVideoThumb = false,
}: MovieArtProps) {
  const [posterUrl, setPosterUrl] = useState<string | undefined>(
    movie.poster &&
      (movie.poster.startsWith("/") ||
        movie.poster.startsWith("http") ||
        movie.poster.startsWith("blob:"))
      ? movie.poster
      : undefined,
  );
  const [videoUrl, setVideoUrl] = useState<string | undefined>(
    movie.video &&
      (movie.video.startsWith("/") ||
        movie.video.startsWith("http") ||
        movie.video.startsWith("blob:"))
      ? movie.video
      : undefined,
  );
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
    let active = true;

    // 1. If real poster exists, resolve it
    if (movie.poster) {
      if (
        movie.poster.startsWith("/") ||
        movie.poster.startsWith("http") ||
        movie.poster.startsWith("blob:")
      ) {
        setPosterUrl(movie.poster);
      } else {
        mediaGateway
          .resolve(movie.poster)
          .then((resolved) => {
            if (active && resolved) setPosterUrl(resolved);
          })
          .catch(() => {});
      }
      return () => {
        active = false;
      };
    }

    // 2. If no poster, resolve video to display real video thumbnail frame (only if not disabled)
    setPosterUrl(undefined);
    if (!disableVideoThumb && movie.video) {
      if (
        movie.video.startsWith("/") ||
        movie.video.startsWith("http") ||
        movie.video.startsWith("blob:")
      ) {
        setVideoUrl(movie.video);
      } else {
        mediaGateway
          .resolve(movie.video)
          .then((resolved) => {
            if (active && resolved) setVideoUrl(resolved);
          })
          .catch(() => {});
      }
    } else {
      setVideoUrl(undefined);
    }

    return () => {
      active = false;
    };
  }, [movie.poster, movie.video, disableVideoThumb]);

  const [videoError, setVideoError] = useState(false);

  return (
    <div
      className={`movie-art ${className}`}
      style={
        {
          "--c1": movie.colors?.[0] || "#1e293b",
          "--c2": movie.colors?.[1] || "#0f172a",
        } as React.CSSProperties
      }
    >
      {posterUrl && !imageError ? (
        <img
          src={posterUrl}
          alt={movie.title}
          loading="lazy"
          className="movie-art-img"
          onError={() => setImageError(true)}
        />
      ) : !disableVideoThumb && videoUrl && !videoError ? (
        <video
          src={`${videoUrl}#t=0.5`}
          preload="metadata"
          muted
          playsInline
          className="movie-art-video-thumb"
          onError={() => setVideoError(true)}
        />
      ) : (
        <div
          className="movie-art-clean-fallback"
          style={{
            background: `linear-gradient(135deg, ${movie.colors?.[0] || "#1e293b"} 0%, ${movie.colors?.[1] || "#0f172a"} 100%)`,
          }}
        >
          <Film size={20} style={{ opacity: 0.8, color: "var(--accent, #f5a524)" }} />
          <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>{movie.title}</span>
        </div>
      )}
    </div>
  );
}
