"use client";

import React, { useState, useRef, useEffect } from "react";
import { Avatar } from "@/components/ui/Avatar";
import {
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  ShieldAlert,
  UserCheck,
  User as UserIcon,
} from "lucide-react";
import { formatLastSeen } from "@/utils/date";

interface ChatHeaderProps {
  contactName: string;
  contactUsername?: string;
  contactAvatar?: string | null;
  contactBio?: string | null;
  isOnline?: boolean;
  lastSeen?: string | null;
  isBlocked?: boolean;
  onBackMobile?: () => void;
  onBlockToggle?: () => void;
  onViewProfile?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  contactName,
  contactUsername,
  contactAvatar,
  contactBio,
  isOnline = false,
  lastSeen,
  isBlocked = false,
  onBackMobile,
  onBlockToggle,
  onViewProfile,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-surface-200/95 border-b border-card-border/70 backdrop-blur-md z-20">
      {/* Contact Info and Avatar */}
      <div className="flex items-center gap-3 min-w-0">
        {onBackMobile && (
          <button
            onClick={onBackMobile}
            className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-white rounded-full hover:bg-surface-100 transition-colors"
            title="Back to chats"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="relative">
          <Avatar
            src={contactAvatar}
            name={contactName}
            size="md"
            isOnline={isOnline}
            ringColor="cyan"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white truncate leading-tight">
              {contactName}
            </h2>
            {contactUsername && (
              <span className="text-xs text-slate-400 hidden sm:inline truncate">
                @{contactUsername}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            {isOnline ? (
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                {formatLastSeen(lastSeen)}
              </span>
            )}
            {isBlocked && (
              <span className="ml-1 text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                Blocked
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Icons matching reference mockup */}
      <div className="flex items-center gap-1 sm:gap-2 text-slate-400">
        <button
          onClick={() => alert("Voice call initiated (demo)")}
          className="p-2 hover:text-brand-light hover:bg-surface-100 rounded-full transition-colors"
          title="Start voice call"
        >
          <Phone className="w-5 h-5" />
        </button>

        <button
          onClick={() => alert("Video call initiated (demo)")}
          className="p-2 hover:text-brand-light hover:bg-surface-100 rounded-full transition-colors"
          title="Start video call"
        >
          <Video className="w-5 h-5" />
        </button>

        {/* Options Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:text-white hover:bg-surface-100 rounded-full transition-colors"
            title="More actions"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-card border border-card-border rounded-2xl p-1.5 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-100 text-xs">
              {onViewProfile && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onViewProfile();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-surface-100 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-brand-light" />
                  <span>View Profile</span>
                </button>
              )}

              {onBlockToggle && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onBlockToggle();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                    isBlocked
                      ? "text-emerald-400 hover:bg-emerald-500/10"
                      : "text-rose-400 hover:bg-rose-500/10"
                  }`}
                >
                  {isBlocked ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Unblock User</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4" />
                      <span>Block User</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
