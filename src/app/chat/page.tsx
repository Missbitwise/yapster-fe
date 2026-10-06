"use client";

import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SidebarNav, NavTab } from "@/components/layout/SidebarNav";
import { ConversationsList } from "@/components/layout/ConversationsList";
import { ChatArea } from "@/components/chat/ChatArea";
import { NearbyRadar } from "@/components/nearby/NearbyRadar";
import { FriendsTab } from "@/components/friends/FriendsTab";
import { FriendRequestsModal } from "@/components/friends/FriendRequestsModal";
import { BlockedUsersModal } from "@/components/friends/BlockedUsersModal";
import { UserProfileModal } from "@/components/layout/UserProfileModal";
import { LocationPromptModal } from "@/components/location/LocationPromptModal";
import { useFriends } from "@/hooks/useFriends";
import { useNearby } from "@/hooks/useNearby";
import { useWebSocket } from "@/context/WebSocketContext";
import { useToast } from "@/context/ToastContext";
import { Friend } from "@/types/friend.types";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare, Sparkles, Compass, MapPin } from "lucide-react";

export default function ChatDashboardPage() {
  const { user } = useAuth();
  const {
    friends,
    requests,
    blockedUsers,
    respondRequest,
    sendRequest,
    blockUser,
    unblockUser,
    isBlocked,
  } = useFriends();

  const {
    currentLocality,
    hasLocation,
    updateLocation,
  } = useNearby(10);

  const { subscribe } = useWebSocket();
  const { showToast } = useToast();

  const [currentTab, setCurrentTab] = useState<NavTab>("chats");
  const [activeContact, setActiveContact] = useState<Friend | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Check if location prompt should appear automatically on first entry
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasPrompted = localStorage.getItem("yapster_location_prompted");
      if (!hasPrompted && !hasLocation) {
        // Automatically prompt after 1.5 seconds so UI settles
        const timer = setTimeout(() => {
          setIsLocationModalOpen(true);
          localStorage.setItem("yapster_location_prompted", "true");
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [hasLocation]);

  // Auto-select first friend if on desktop and none selected
  useEffect(() => {
    if (friends.length > 0 && !activeContact && typeof window !== "undefined") {
      if (window.innerWidth >= 768) {
        setActiveContact(friends[0]);
      }
    }
  }, [friends, activeContact]);

  // Real-time Ephemeral notifications for messages and friend requests
  useEffect(() => {
    const unsubscribe = subscribe((payload) => {
      if (payload.type === "message") {
        const msg = payload.data;
        if (msg.receiverId === user?.id && msg.senderId !== activeContact?.id) {
          const senderFriend = friends.find((f) => f.id === msg.senderId);
          showToast({
            title: senderFriend ? senderFriend.name : "New Message",
            description: msg.content,
            avatarSrc: senderFriend?.profile_picture,
            avatarName: senderFriend?.name || "Friend",
            type: "message",
            onClick: () => {
              if (senderFriend) {
                setCurrentTab("chats");
                setActiveContact(senderFriend);
              }
            },
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe, user?.id, activeContact?.id, friends, showToast]);

  const handleTabSelect = (tab: NavTab) => {
    if (tab === "requests") {
      setIsRequestsModalOpen(true);
    } else if (tab === "blocked") {
      setIsBlockedModalOpen(true);
    } else {
      setCurrentTab(tab);
    }
  };

  const handleOpenChatWithContact = (contact: Friend) => {
    setActiveContact(contact);
    setCurrentTab("chats");
  };

  const handleBlockToggle = async () => {
    if (!activeContact) return;
    const contactId = activeContact.id;
    const blocked = isBlocked(contactId);

    if (blocked) {
      await unblockUser(contactId);
      showToast({
        title: "User Unblocked",
        description: `Unblocked ${activeContact.name}`,
        type: "success",
      });
    } else {
      if (confirm(`Are you sure you want to block ${activeContact.name}?`)) {
        await blockUser(contactId);
        showToast({
          title: "User Blocked",
          description: `Blocked ${activeContact.name}`,
          type: "info",
        });
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        {/* Leftmost Sidebar Icon Navigation */}
        <SidebarNav
          currentTab={currentTab}
          onSelectTab={handleTabSelect}
          pendingRequestsCount={requests.length}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* Tab Specific Content Area */}
        {currentTab === "chats" && (
          <div className="flex-1 flex overflow-hidden">
            {/* Middle Conversations Column (hidden on mobile when a chat is open) */}
            <div
              className={`w-full md:w-80 lg:w-96 shrink-0 h-full flex flex-col ${
                activeContact ? "hidden md:flex" : "flex"
              }`}
            >
              {/* Location Pill Bar at top of conversations list */}
              <div className="px-4 pt-3 pb-1 bg-surface-300">
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-full bg-surface-100 hover:bg-surface-50 border border-card-border hover:border-brand/40 text-[11px] text-slate-300 transition-colors"
                  title="Click to update your location"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-brand-light shrink-0" />
                    <span className="truncate">
                      {currentLocality
                        ? `Area: ${currentLocality}`
                        : "Enable Location to Find Nearby"}
                    </span>
                  </div>
                  <span className="text-[10px] text-brand-light font-semibold shrink-0 ml-1">
                    {hasLocation ? "Active" : "Set GPS"}
                  </span>
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <ConversationsList
                  friends={friends}
                  activeContactId={activeContact?.id || null}
                  onSelectContact={(contact) => setActiveContact(contact)}
                  onOpenNearby={() => setCurrentTab("nearby")}
                />
              </div>
            </div>

            {/* Right Active Chat Area */}
            <div
              className={`flex-1 h-full ${
                !activeContact ? "hidden md:flex" : "flex"
              }`}
            >
              {activeContact ? (
                <div className="w-full h-full">
                  <ChatArea
                    contact={activeContact}
                    isBlocked={isBlocked(activeContact.id)}
                    onBlockToggle={handleBlockToggle}
                    onBackMobile={() => setActiveContact(null)}
                    onViewProfile={() => setIsProfileOpen(true)}
                  />
                </div>
              ) : (
                <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-surface-300 text-slate-400 p-8 text-center select-none">
                  <div className="w-20 h-20 rounded-3xl bg-surface-100 border border-card-border flex items-center justify-center text-brand mb-4 shadow-glow">
                    <MessageSquare className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Your Yapster Messages
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mb-6">
                    Select a conversation from the left to start yapping in real
                    time, or explore nearby people to make new friends.
                  </p>
                  <button
                    onClick={() => setCurrentTab("nearby")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-glow transition-all"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Find Nearby Friends</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nearby Radar Tab */}
        {currentTab === "nearby" && (
          <div className="flex-1 h-full overflow-hidden">
            <NearbyRadar
              friends={friends}
              onOpenChat={handleOpenChatWithContact}
              onSendFriendRequest={sendRequest}
              onBlockUser={blockUser}
            />
          </div>
        )}

        {/* All Friends Directory Tab */}
        {currentTab === "friends" && (
          <div className="flex-1 h-full overflow-hidden">
            <FriendsTab
              friends={friends}
              onOpenChat={handleOpenChatWithContact}
              onBlockUser={blockUser}
              onExploreNearby={() => setCurrentTab("nearby")}
            />
          </div>
        )}

        {/* Upfront Automatic Location Prompt Modal */}
        <LocationPromptModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          onLocationSuccess={async (lat, lng, locality) => {
            await updateLocation(lat, lng, locality);
            showToast({
              title: "Location Updated",
              description: `GPS coordinates saved (${locality})`,
              type: "success",
            });
          }}
        />

        {/* Modals */}
        <FriendRequestsModal
          isOpen={isRequestsModalOpen}
          onClose={() => setIsRequestsModalOpen(false)}
          requests={requests}
          onRespond={respondRequest}
        />

        <BlockedUsersModal
          isOpen={isBlockedModalOpen}
          onClose={() => setIsBlockedModalOpen(false)}
          blockedUsers={blockedUsers}
          onUnblock={unblockUser}
        />

        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
}
