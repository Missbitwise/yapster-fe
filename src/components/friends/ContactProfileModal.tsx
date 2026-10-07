"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Friend } from "@/types/friend.types";
import { Calendar, ShieldAlert, UserCheck, MessageSquare, AtSign } from "lucide-react";
import { formatJoinDate, formatLastSeen } from "@/utils/date";

interface ContactProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Friend | null;
  isOnline?: boolean;
  lastSeen?: string | null;
  isBlocked?: boolean;
  onBlockToggle?: () => void;
  onSendMessage?: () => void;
}

export const ContactProfileModal: React.FC<ContactProfileModalProps> = ({
  isOpen,
  onClose,
  contact,
  isOnline = false,
  lastSeen,
  isBlocked = false,
  onBlockToggle,
  onSendMessage,
}) => {
  if (!contact) return null;

  const joinDateFormatted = formatJoinDate(contact.created_at || contact.friends_since);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile" maxWidth="sm">
      <div className="flex flex-col items-center text-center space-y-4 pt-2">
        <div className="relative">
          <Avatar
            src={contact.profile_picture}
            name={contact.name}
            size="xl"
            ringColor="purple"
            isOnline={isOnline}
          />
        </div>

        <div>
          <h3 className="text-lg font-bold text-white leading-tight">
            {contact.name}
          </h3>
          <div className="flex items-center justify-center gap-1 text-xs text-brand-light font-medium mt-0.5">
            <AtSign className="w-3 h-3" />
            <span>{contact.username}</span>
          </div>

          <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[11px]">
            {isOnline ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online Now
              </span>
            ) : (
              <span className="text-slate-400">
                {formatLastSeen(lastSeen ?? contact.last_seen)}
              </span>
            )}
          </div>
        </div>

        {/* Bio Section - Only displayed when other user views profile */}
        <div className="w-full">
          <div className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
            Bio
          </div>
          {contact.bio ? (
            <p className="text-xs text-slate-200 italic px-4 py-3 bg-surface-100 rounded-2xl border border-card-border w-full text-left leading-relaxed">
              &quot;{contact.bio}&quot;
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic px-4 py-3 bg-surface-100/50 rounded-2xl border border-card-border/50 w-full text-left">
              No bio provided yet.
            </p>
          )}
        </div>

        {/* User Details */}
        <div className="w-full space-y-2 pt-2 text-xs text-left border-t border-card-border/60">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-100/60 text-slate-300">
            <Calendar className="w-4 h-4 text-brand-light shrink-0" />
            <span>Joined Yapster: {joinDateFormatted}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-2 pt-2">
          {onSendMessage && (
            <button
              onClick={() => {
                onClose();
                onSendMessage();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-glow transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          )}

          {onBlockToggle && (
            <button
              onClick={() => {
                onClose();
                onBlockToggle();
              }}
              className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-2xl text-xs font-medium border transition-all ${
                isBlocked
                  ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/20"
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
      </div>
    </Modal>
  );
};
