"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { X, MessageSquare, UserPlus, CheckCircle } from "lucide-react";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  avatarSrc?: string | null;
  avatarName?: string;
  type?: "message" | "friend_request" | "success" | "info";
  onClick?: () => void;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { ...toast, id };
      setToasts((prev) => [newToast, ...prev].slice(0, 5));

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => {
              if (toast.onClick) toast.onClick();
              removeToast(toast.id);
            }}
            className="pointer-events-auto bg-card border border-brand/40 shadow-glow rounded-2xl p-3.5 flex items-start gap-3 text-slate-100 backdrop-blur-md cursor-pointer hover:border-brand transition-all animate-in slide-in-from-top-4 duration-200"
          >
            {toast.avatarName ? (
              <Avatar
                src={toast.avatarSrc}
                name={toast.avatarName}
                size="sm"
                ringColor="purple"
              />
            ) : toast.type === "message" ? (
              <div className="p-2 rounded-full bg-brand/20 text-brand-light">
                <MessageSquare className="w-5 h-5" />
              </div>
            ) : toast.type === "friend_request" ? (
              <div className="p-2 rounded-full bg-indigo-500/20 text-indigo-400">
                <UserPlus className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">
                {toast.title}
              </h4>
              {toast.description && (
                <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
