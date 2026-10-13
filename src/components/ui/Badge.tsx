import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "purple" | "active" | "neutral" | "danger";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "purple",
  size = "md",
  className = "",
}) => {
  const variantStyles = {
    purple:
      "bg-brand text-white  font-medium",
    active:
      "bg-surface-100 border border-card-border text-sky-200 shadow-sm",
    neutral: "bg-surface-100 text-slate-300 border border-card-border",
    danger: "bg-rose-900/50 text-rose-300 border border-rose-700/50",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs rounded-full",
    md: "px-2.5 py-1 text-xs font-semibold rounded-full",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 transition-all ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
