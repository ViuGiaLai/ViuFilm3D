"use client";

import { useState } from "react";
import { avatarOptions } from "@/lib/social-types";
import { avatarFrames } from "@/lib/avatar-frames";
import { avatarFrameMedia } from "@/lib/avatar-frame-media";
import { AvatarFrameArt } from "@/components/ui/avatar-frame-art";

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
          <AvatarFrameArt
            frameId={frame.id}
            shape={frame.shape}
            color={frame.color}
            symbol={frame.symbol}
            name={frame.name}
          />
        )
      )}
    </span>
  );
}
