"use client";

import React, { useState } from "react";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isOnline?: boolean;
  className?: string;
  ringColor?: "purple" | "yellow" | "cyan" | "pink" | "default";
}

const sizeClasses = {
  xs: "w-7 h-7 text-xs",
  sm: "w-9 h-9 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
};

const ringColorClasses = {
  purple: "ring-2 ring-purple-500/80 shadow-[0_0_10px_rgba(168,85,247,0.4)]",
  yellow: "ring-2 ring-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.4)]",
  cyan: "ring-2 ring-cyan-400/80 shadow-[0_0_10px_rgba(34,211,238,0.4)]",
  pink: "ring-2 ring-pink-500/80 shadow-[0_0_10px_rgba(236,72,153,0.4)]",
  default: "",
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = "User",
  size = "md",
  isOnline,
  className = "",
  ringColor = "default",
}) => {
  const [imgError, setImgError] = useState(false);

  // Generate deterministic avatar URL if no valid image is provided
  const fallbackUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(
    name
  )}&backgroundColor=1f2132`;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const currentSizeClass = sizeClasses[size];
  const ringClass = ringColorClasses[ringColor];

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      <div
        className={`relative overflow-hidden rounded-full bg-surface-100 flex items-center justify-center font-semibold text-slate-200 transition-transform ${currentSizeClass} ${ringClass}`}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={fallbackUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-background transition-colors ${
            size === "xs"
              ? "w-2 h-2"
              : size === "sm"
              ? "w-2.5 h-2.5"
              : size === "md"
              ? "w-3 h-3"
              : "w-4 h-4"
          } ${
            isOnline
              ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
              : "bg-slate-500"
          }`}
          title={isOnline ? "Online" : "Offline"}
        />
      )}
    </div>
  );
};
