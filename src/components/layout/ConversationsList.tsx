"use client";

import React, { useState, useMemo } from "react";
import { Friend } from "@/types/friend.types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useWebSocket } from "@/context/WebSocketContext";
import { Search, Sparkles, MessageCircle } from "lucide-react";
import { formatLastSeenCompact } from "@/utils/date";

interface ConversationsListProps {
  friends: Friend[];
  activeContactId: string | null;
  onSelectContact: (contact: Friend) => void;
  onOpenNearby?: () => void;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  friends,
  activeContactId,
  onSelectContact,
  onOpenNearby,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { presenceMap, typingMap, unreadTotal } = useWebSocket();

  // Filter friends based on search query
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    const q = searchQuery.toLowerCase();
    return friends.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.username.toLowerCase().includes(q)
    );
  }, [friends, searchQuery]);

  // Identify currently active (online) friends for the top rail
  const activeFriends = useMemo(() => {
    return friends.filter((f) => presenceMap[f.id]?.status === "online");
  }, [friends, presenceMap]);

  const avatarRings: Array<"purple" | "yellow" | "cyan" | "pink"> = [
    "yellow",
    "cyan",
    "pink",
    "purple",
  ];

  return (
    <div className="flex flex-col h-full bg-surface-300 border-r border-card-border/70 select-none overflow-hidden">
      {/* Top Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-3.5">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Messages</span>
            {unreadTotal > 0 && (
              <Badge variant="purple" size="sm">
                {unreadTotal}
              </Badge>
            )}
          </h1>
          {onOpenNearby && (
            <button
              onClick={onOpenNearby}
              className="p-1.5 rounded-xl bg-surface-100 border border-card-border hover:border-brand text-brand-light hover:text-white transition-all text-xs flex items-center gap-1.5"
              title="Explore Nearby Friends"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nearby</span>
            </button>
          )}
        </div>

        {/* Pill Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends or contacts..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-100 border border-card-border/80 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {/* Currently Active Horizontal Rail (Matching reference image) */}
        {activeFriends.length > 0 && (
          <div>
            <div className="flex items-center gap-2 px-1 mb-2.5">
              <Badge variant="active" size="sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Currently Active
              </Badge>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 px-1 scrollbar-none">
              {activeFriends.map((friend, idx) => {
                const ring = avatarRings[idx % avatarRings.length];
                const isSelected = activeContactId === friend.id;

                return (
                  <button
                    key={friend.id}
                    onClick={() => onSelectContact(friend)}
                    className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
                  >
                    <div
                      className={`p-0.5 rounded-full transition-transform group-hover:scale-105 ${
                        isSelected ? "scale-105 ring-2 ring-brand" : ""
                      }`}
                    >
                      <Avatar
                        src={friend.profile_picture}
                        name={friend.name}
                        size="md"
                        ringColor={ring}
                        isOnline={true}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300 max-w-[62px] truncate group-hover:text-white">
                      {friend.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Recents Section Header */}
        <div>
          <div className="flex items-center gap-2 px-1 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recents
            </span>
          </div>

          {/* Conversations list */}
          {filteredFriends.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-400">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-xs">
                {searchQuery
                  ? "No contacts matching your search"
                  : "No friends yet. Discover nearby users or add friends!"}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredFriends.map((friend, idx) => {
                const isSelected = activeContactId === friend.id;
                const presence = presenceMap[friend.id];
                const isOnline = presence?.status === "online";
                const lastSeen =
                  presence?.lastSeen !== undefined
                    ? presence.lastSeen
                    : friend.last_seen;
                const isTyping = !!typingMap[friend.id];
                const ring = avatarRings[idx % avatarRings.length];

                return (
                  <button
                    key={friend.id}
                    onClick={() => onSelectContact(friend)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left group ${
                      isSelected
                        ? "bg-card border border-brand/50 shadow-glow-sm"
                        : "hover:bg-surface-100/70 border border-transparent"
                    }`}
                  >
                    <Avatar
                      src={friend.profile_picture}
                      name={friend.name}
                      size="md"
                      isOnline={isOnline}
                      ringColor={ring}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h3 className="text-sm font-semibold text-white truncate group-hover:text-brand-light transition-colors">
                          {friend.name}
                        </h3>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {isOnline ? (
                            <span className="text-emerald-400 font-medium">Online</span>
                          ) : (
                            formatLastSeenCompact(lastSeen)
                          )}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 truncate">
                        {isTyping ? (
                          <span className="text-brand-light font-medium animate-pulse">
                            typing...
                          </span>
                        ) : friend.bio ? (
                          friend.bio
                        ) : (
                          `@${friend.username}`
                        )}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
