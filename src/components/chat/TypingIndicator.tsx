"use client";

import React from "react";

interface TypingIndicatorProps {
  name?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  name = "User",
}) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-brand-light font-medium animate-pulse">
      <div className="flex items-center gap-1 bg-surface-100/80 px-3 py-1.5 rounded-full border border-card-border">
        <span className="text-slate-300">{name} is typing</span>
        <span className="inline-flex gap-1 items-center ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-light animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-light animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-light animate-bounce" />
        </span>
      </div>
    </div>
  );
};
