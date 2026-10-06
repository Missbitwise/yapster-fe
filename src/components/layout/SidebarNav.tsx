"use client";

import React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import {
  MessageSquare,
  Compass,
  Users,
  UserPlus,
  ShieldAlert,
  LogOut,
  Sparkles,
} from "lucide-react";

export type NavTab = "chats" | "nearby" | "friends" | "requests" | "blocked";

interface SidebarNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingRequestsCount: number;
  onOpenProfile: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentTab,
  onSelectTab,
  pendingRequestsCount,
  onOpenProfile,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    {
      id: "chats" as NavTab,
      label: "Messages",
      icon: MessageSquare,
      badge: 0,
    },
    {
      id: "nearby" as NavTab,
      label: "Nearby Friends",
      icon: Compass,
      badge: 0,
    },
    {
      id: "friends" as NavTab,
      label: "All Friends",
      icon: Users,
      badge: 0,
    },
    {
      id: "requests" as NavTab,
      label: "Friend Requests",
      icon: UserPlus,
      badge: pendingRequestsCount,
    },
    {
      id: "blocked" as NavTab,
      label: "Blocked Users",
      icon: ShieldAlert,
      badge: 0,
    },
  ];

  return (
    <aside className="w-16 sm:w-20 bg-surface-400 border-r border-card-border/80 flex flex-col items-center justify-between py-5 shrink-0 z-30 select-none">
      {/* Brand Icon */}
      <div className="flex flex-col items-center gap-6">
        <div
          onClick={() => onSelectTab("chats")}
          className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-dark via-brand to-purple-400 p-0.5 shadow-glow cursor-pointer flex items-center justify-center transition-transform hover:scale-105"
          title="Yapster"
        >
          <div className="w-full h-full bg-surface-300 rounded-[14px] flex items-center justify-center">
            <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-purple-200">
              Y
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative p-3 rounded-2xl transition-all group focus:outline-none ${
                  isActive
                    ? "bg-brand text-white shadow-glow-sm"
                    : "text-slate-400 hover:text-white hover:bg-surface-100"
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />

                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Logout */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onOpenProfile}
          className="p-1 rounded-full hover:ring-2 hover:ring-brand transition-all focus:outline-none"
          title="View profile"
        >
          <Avatar
            src={user?.profile_picture}
            name={user?.name || "User"}
            size="sm"
            isOnline={true}
          />
        </button>

        <button
          onClick={logout}
          className="p-2.5 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
