"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { LogOut, Mail, User as UserIcon, Calendar } from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Profile" maxWidth="sm">
      <div className="flex flex-col items-center text-center space-y-4 pt-2">
        <Avatar
          src={user.profile_picture}
          name={user.name}
          size="xl"
          ringColor="purple"
          isOnline={true}
        />

        <div>
          <h3 className="text-lg font-bold text-white">{user.name}</h3>
          <p className="text-xs text-brand-light font-medium">@{user.username}</p>
        </div>

        {user.bio ? (
          <p className="text-xs text-slate-300 italic px-4 bg-surface-100 py-2.5 rounded-2xl border border-card-border w-full">
            &quot;{user.bio}&quot;
          </p>
        ) : (
          <p className="text-xs text-slate-500 italic">No bio provided yet.</p>
        )}

        <div className="w-full space-y-2 pt-2 text-xs text-left border-t border-card-border/60">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-100/50 text-slate-300">
            <Mail className="w-4 h-4 text-brand-light" />
            <span className="truncate">{user.email}</span>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-100/50 text-slate-300">
            <Calendar className="w-4 h-4 text-brand-light" />
            <span>Joined Yapster: {joinDate}</span>
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            logout();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all mt-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Yapster</span>
        </button>
      </div>
    </Modal>
  );
};
