"use client";

import { useState } from "react";
import { avatarOptions } from "@/lib/social-types";
import { avatarFrames } from "@/lib/avatar-frames";
import { avatarFrameMedia } from "@/lib/avatar-frame-media";

type Props = {
  avatarId?: string | null;
  userId?: number;
  avatarVersion?: string | null;
  name: string;
  size?: "small" | "medium" | "large";
  className?: string;
  frameId?: string;
  cultivationXp?: number;
};

export function UserAvatar({
  avatarId,
  userId,
  avatarVersion,
  name,
  size = "medium",
  className = "",
  frameId,
}: Props) {
  const [failedSource, setFailedSource] = useState("");
  const option = avatarOptions.find((item) => item.id === avatarId);
  // Equipped frames come from server-validated profiles (including admin grants).
  // Unlock checks belong to the save API, not rendering another user's identity.
  const frame =
    avatarFrames.find((item) => item.id === frameId) ?? avatarFrames[0];
  const media = avatarFrameMedia[frame.id];
  const [failedMedia, setFailedMedia] = useState("");
  const source =
    avatarId === "upload" && userId
      ? `/api/v1/avatars/${userId}?v=${encodeURIComponent(avatarVersion ?? "0")}`
      : "";
  return (
    <span
      className={`user-avatar user-avatar--${option?.id ?? "moon"} user-avatar--${size} ${className}`}
      role="img"
      aria-label={`Ảnh đại diện của ${name}${frame.id !== "none" ? `, viền ${frame.name}` : ""}`}
    >
      {source && source !== failedSource ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={source}
          alt=""
          decoding="async"
          loading={size === "large" ? "eager" : "lazy"}
          onError={() => setFailedSource(source)}
        />
      ) : (
        (option?.symbol ?? name.charAt(0).toUpperCase())
      )}
      {media && failedMedia !== media.src ? (
        <picture
          className="avatar-frame-media"
          style={{
            width: `${media.scale * 100}%`,
            height: `${media.scale * 100}%`,
            left: `${(1 - media.scale) * 50}%`,
            top: `${(1 - media.scale) * 50}%`,
          }}
        >
          <source
            media="(prefers-reduced-motion: reduce)"
            srcSet={media.poster}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.src}
            alt=""
            aria-hidden="true"
            decoding="async"
            loading={size === "large" ? "eager" : "lazy"}
            onError={() => setFailedMedia(media.src)}
          />
        </picture>
      ) : (
        frame.id !== "none" && (
          <svg
            className={`avatar-frame-art avatar-frame-art--${frame.shape}`}
            viewBox="0 0 100 100"
            aria-hidden="true"
            style={{ color: frame.color }}
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            {frame.shape === "ring" && (
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="7 4"
              />
            )}
            {frame.shape === "rays" && (
              <path
                d="M50 1 54 10 50 7 46 10Z M99 50 90 54 93 50 90 46Z M50 99 46 90 50 93 54 90Z M1 50 10 46 7 50 10 54Z M15 15 25 20 20 25Z M85 15 80 25 75 20Z M85 85 75 80 80 75Z M15 85 20 75 25 80Z"
                fill="currentColor"
              />
            )}
            {frame.shape === "wings" && (
              <path
                d="M10 58 Q-5 40 1 17 Q7 28 17 31 L6 13 Q24 24 26 38 M90 58 Q105 40 99 17 Q93 28 83 31 L94 13 Q76 24 74 38"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinejoin="round"
              />
            )}
            {frame.shape === "jewel" && (
              <path
                d="M50 0 57 7 50 14 43 7Z M100 50 93 57 86 50 93 43Z M50 100 43 93 50 86 57 93Z M0 50 7 43 14 50 7 57Z"
                fill="currentColor"
              />
            )}
            {frame.shape === "runes" && (
              <g className="avatar-frame-orbit">
                <circle
                  cx="50"
                  cy="50"
                  r="49"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="2 5"
                />
                <path
                  d="M50 2 92 26 92 74 50 98 8 74 8 26Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </g>
            )}
            <circle
              cx="50"
              cy="91"
              r="8"
              fill="#161b24"
              stroke="currentColor"
            />
            <text
              x="50"
              y="94"
              textAnchor="middle"
              fontSize="10"
              fill="currentColor"
            >
              {frame.symbol}
            </text>
          </svg>
        )
      )}
    </span>
  );
}
