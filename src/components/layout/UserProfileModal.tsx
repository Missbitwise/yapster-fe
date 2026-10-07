"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import {
  LogOut,
  Mail,
  Calendar,
  Edit3,
  Check,
  X,
  User as UserIcon,
  AtSign,
  Smile,
} from "lucide-react";
import { formatJoinDate } from "@/utils/date";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AVATAR_PRESETS = [
  {
    id: "p1",
    name: "Cyber Bot",
    url: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=CyberBot&backgroundColor=6366f1",
  },
  {
    id: "p2",
    name: "Neon Spark",
    url: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=NeonSpark&backgroundColor=ec4899",
  },
  {
    id: "p3",
    name: "Pulse",
    url: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Pulse&backgroundColor=10b981",
  },
  {
    id: "p4",
    name: "Quantum",
    url: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Quantum&backgroundColor=8b5cf6",
  },
  {
    id: "p5",
    name: "Aura",
    url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Aura&backgroundColor=f43f5e",
  },
  {
    id: "p6",
    name: "Kai",
    url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Kai&backgroundColor=06b6d4",
  },
  {
    id: "p7",
    name: "Luna",
    url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Luna&backgroundColor=a855f7",
  },
  {
    id: "p8",
    name: "Milo",
    url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Milo&backgroundColor=f59e0b",
  },
  {
    id: "p9",
    name: "Shadow",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Shadow&backgroundColor=3b82f6",
  },
  {
    id: "p10",
    name: "Vortex",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Vortex&backgroundColor=14b8a6",
  },
  {
    id: "p11",
    name: "Nova",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nova&backgroundColor=8b5cf6",
  },
  {
    id: "p12",
    name: "Cosmo",
    url: "https://api.dicebear.com/7.x/micah/svg?seed=Cosmo&backgroundColor=6366f1",
  },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, logout, updateUserLocally } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state whenever modal opens or user updates
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
      setSelectedAvatar(user.profile_picture || AVATAR_PRESETS[0].url);
    }
  }, [user, isOpen]);

  if (!user) return null;

  const joinDate = formatJoinDate(user.created_at);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) return;

    updateUserLocally({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      bio: bio.trim(),
      profile_picture: selectedAvatar,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
    }, 600);
  };

  const handleCancel = () => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
      setSelectedAvatar(user.profile_picture || AVATAR_PRESETS[0].url);
    }
    setIsEditing(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsEditing(false);
        onClose();
      }}
      title={isEditing ? "Edit Profile" : "My Profile"}
      maxWidth={isEditing ? "md" : "sm"}
    >
      {!isEditing ? (
        /* View Profile Mode */
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
            <p className="text-xs text-slate-300 italic px-4 bg-surface-100 py-3 rounded-2xl border border-card-border w-full text-left leading-relaxed">
              &quot;{user.bio}&quot;
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic px-4 py-2 bg-surface-100/50 rounded-2xl border border-card-border/50 w-full">
              No bio added yet. Tap &apos;Edit Profile&apos; below to write one!
            </p>
          )}

          <div className="w-full space-y-2 pt-2 text-xs text-left border-t border-card-border/60">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-100/50 text-slate-300">
              <Mail className="w-4 h-4 text-brand-light shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-100/50 text-slate-300">
              <Calendar className="w-4 h-4 text-brand-light shrink-0" />
              <span>Joined Yapster: {joinDate}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-2 pt-2">
            <button
              onClick={() => setIsEditing(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-glow transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Yapster</span>
            </button>
          </div>
        </div>
      ) : (
        /* Edit Profile Mode */
        <form onSubmit={handleSave} className="space-y-4 pt-1 max-h-[75vh] overflow-y-auto px-1">
          {/* Avatar Picker Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Choose Profile Icon
            </label>
            <div className="flex items-center gap-3 mb-3 p-3 bg-surface-100/60 rounded-2xl border border-card-border">
              <Avatar
                src={selectedAvatar}
                name={name || "User"}
                size="lg"
                ringColor="purple"
              />
              <div className="text-left text-xs">
                <p className="font-semibold text-white">Current Selection</p>
                <p className="text-slate-400 text-[11px]">
                  Select from the preset avatars below
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 p-2.5 bg-surface-100/40 rounded-2xl border border-card-border/60">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = selectedAvatar === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedAvatar(preset.url)}
                    className={`relative p-1 rounded-2xl transition-all focus:outline-none flex flex-col items-center group ${
                      isSelected
                        ? "bg-brand/20 ring-2 ring-brand scale-105 shadow-glow-sm"
                        : "hover:bg-surface-50 hover:scale-105"
                    }`}
                    title={preset.name}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-200">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 max-w-[48px] truncate group-hover:text-white">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-100 border border-card-border text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand transition-colors"
              />
            </div>
          </div>

          {/* Username Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Username
            </label>
            <div className="relative">
              <AtSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourusername"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-100 border border-card-border text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand transition-colors"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-100 border border-card-border text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand transition-colors"
              />
            </div>
          </div>

          {/* Bio Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Bio
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others what you're up to..."
                maxLength={160}
                className="w-full p-3 rounded-xl bg-surface-100 border border-card-border text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand transition-colors resize-none"
              />
            </div>
            <div className="flex justify-end text-[10px] text-slate-500 mt-0.5">
              {bio.length}/160
            </div>
          </div>

          {/* Joined Yapster specific date banner */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-100/40 border border-card-border/50 text-[11px] text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-brand-light shrink-0" />
            <span>Joined Yapster on {joinDate}</span>
          </div>

          {/* Save / Cancel Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2.5 px-4 rounded-xl bg-surface-100 hover:bg-surface-50 text-slate-300 text-xs font-semibold transition-colors border border-card-border"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-glow transition-all"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
