"use client";

import React, { useState, useMemo } from "react";
import { Friend } from "@/types/friend.types";
import { Avatar } from "@/components/ui/Avatar";
import { useWebSocket } from "@/context/WebSocketContext";
import { Search, MessageCircle, ShieldAlert, Users, Compass } from "lucide-react";
import { formatLastSeen } from "@/utils/date";
import { BlockUserModal } from "./BlockUserModal";

interface FriendsTabProps {
  friends: Friend[];
  onOpenChat: (friend: Friend) => void;
  onBlockUser: (userId: string) => Promise<any>;
  onExploreNearby?: () => void;
}

export const FriendsTab: React.FC<FriendsTabProps> = ({
  friends,
  onOpenChat,
  onBlockUser,
  onExploreNearby,
}) => {
  const [search, setSearch] = useState("");
  const [userToBlock, setUserToBlock] = useState<Friend | null>(null);
  const { presenceMap } = useWebSocket();

  const filtered = useMemo(() => {
    if (!search.trim()) return friends;
    const q = search.toLowerCase();
    return friends.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.username.toLowerCase().includes(q)
    );
  }, [friends, search]);

  return (
    <div className="flex flex-col h-full bg-surface-300 p-4 sm:p-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-brand" />
            <span>My Friends ({friends.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            People you are connected with on Yapster.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or username..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-100 border border-card-border/80 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 bg-surface-200/40 border border-card-border/60 rounded-3xl p-8">
          <Users className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">
            {search ? "No friends match your search" : "You have no friends yet"}
          </h3>
          <p className="text-xs max-w-sm mb-4">
            {search
              ? "Try searching with a different username or name."
              : "Discover nearby people in your city using Yapster Radar or accept incoming requests!"}
          </p>
          {onExploreNearby && (
            <button
              onClick={onExploreNearby}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-brand text-white text-xs font-semibold hover:bg-brand-dark shadow-glow transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Nearby Users</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((friend) => {
            const presence = presenceMap[friend.id];
            const isOnline = presence?.status === "online";
            const lastSeen =
              presence?.lastSeen !== undefined
                ? presence.lastSeen
                : friend.last_seen;

            return (
              <div
                key={friend.id}
                className="bg-card border border-card-border hover:border-brand/40 rounded-3xl p-5 shadow-lg flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar
                      src={friend.profile_picture}
                      name={friend.name}
                      size="lg"
                      isOnline={isOnline}
                      ringColor="purple"
                    />
                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-white group-hover:text-brand-light transition-colors truncate">
                        {friend.name}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        @{friend.username}
                      </p>
                      <span className="text-[11px] font-medium text-slate-400">
                        {isOnline ? (
                          <span className="text-emerald-400 font-semibold">
                            Online
                          </span>
                        ) : (
                          formatLastSeen(lastSeen)
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-card-border/60">
                  <button
                    onClick={() => onOpenChat(friend)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-glow-sm transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>

                  <button
                    onClick={() => setUserToBlock(friend)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Block friend"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Block Confirmation Modal */}
      <BlockUserModal
        isOpen={!!userToBlock}
        onClose={() => setUserToBlock(null)}
        user={userToBlock}
        onConfirmBlock={async (userId) => {
          await onBlockUser(userId);
        }}
      />
    </div>
  );
};
