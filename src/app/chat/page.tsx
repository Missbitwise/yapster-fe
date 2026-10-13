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
import { ContactProfileModal } from "@/components/friends/ContactProfileModal";
import { BlockUserModal } from "@/components/friends/BlockUserModal";
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
    sentRequests,
    blockedUsers,
    respondRequest,
    sendRequest,
    cancelRequest,
    blockUser,
    unblockUser,
    isBlocked,
  } = useFriends();

  const {
    currentLocality,
    hasLocation,
    updateLocation,
  } = useNearby(10);

  const { subscribe, presenceMap, unreadSendersCount } = useWebSocket();
  const { showToast } = useToast();

  const [currentTab, setCurrentTab] = useState<NavTab>("chats");
  const [activeContact, setActiveContact] = useState<Friend | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [contactProfileToView, setContactProfileToView] = useState<Friend | null>(null);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasPrompted = localStorage.getItem("yapster_location_prompted");
      if (!hasPrompted && !hasLocation) {
        const timer = setTimeout(() => {
          setIsLocationModalOpen(true);
          localStorage.setItem("yapster_location_prompted", "true");
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [hasLocation]);

  useEffect(() => {
    if (friends.length > 0 && !activeContact && typeof window !== "undefined") {
      if (window.innerWidth >= 768) {
        setActiveContact(friends[0]);
      }
    }
  }, [friends, activeContact]);

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
      setUserToBlock({ id: activeContact.id, name: activeContact.name });
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        <SidebarNav
          currentTab={currentTab}
          onSelectTab={handleTabSelect}
          pendingRequestsCount={requests.length}
          unreadMessagesCount={unreadSendersCount}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {currentTab === "chats" && (
          <div className="flex-1 flex overflow-hidden">
            <div
              className={`w-full md:w-80 lg:w-96 shrink-0 h-full flex flex-col ${
                activeContact ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="px-4 pt-3 pb-1 bg-surface-300">
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-full bg-surface-100  border border-card-border  text-[11px] text-slate-300 transition-colors"
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
                  isBlocked={isBlocked}
                />
              </div>
            </div>

            <div
              className={`flex-1 h-full ${
                !activeContact ? "hidden md:flex" : "flex"
              }`}
            >
              {activeContact ? (
                <div className="w-full h-full">
                  <ChatArea
                    key={activeContact.id}
                    contact={activeContact}
                    isBlocked={isBlocked(activeContact.id)}
                    onBlockToggle={handleBlockToggle}
                    onBackMobile={() => setActiveContact(null)}
                    onViewProfile={() => setContactProfileToView(activeContact)}
                  />
                </div>
              ) : (
                <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-surface-300 text-slate-400 p-8 text-center select-none">
                  <div className="w-20 h-20 rounded-3xl bg-surface-100 border border-card-border flex items-center justify-center text-brand mb-4 ">
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
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand  text-white text-xs font-semibold  transition-all"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Find Nearby Friends</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}


        {currentTab === "nearby" && (
          <div className="flex-1 h-full overflow-hidden">
            <NearbyRadar
              friends={friends}
              sentRequests={sentRequests}
              onOpenChat={handleOpenChatWithContact}
              onSendFriendRequest={sendRequest}
              onCancelFriendRequest={cancelRequest}
              onBlockUser={blockUser}
              isBlocked={isBlocked}
            />
          </div>
        )}


        {currentTab === "friends" && (
          <div className="flex-1 h-full overflow-hidden">
            <FriendsTab
              friends={friends}
              onOpenChat={handleOpenChatWithContact}
              onBlockUser={blockUser}
              onExploreNearby={() => setCurrentTab("nearby")}
              isBlocked={isBlocked}
            />
          </div>
        )}


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


        <FriendRequestsModal
          isOpen={isRequestsModalOpen}
          onClose={() => setIsRequestsModalOpen(false)}
          requests={requests}
          sentRequests={sentRequests}
          onRespond={respondRequest}
          onCancelRequest={async (requestId) => {
            await cancelRequest(requestId);
            showToast({
              title: "Request Cancelled",
              description: "Friend request has been cancelled",
              type: "info",
            });
          }}
        />

        <BlockedUsersModal
          isOpen={isBlockedModalOpen}
          onClose={() => setIsBlockedModalOpen(false)}
          blockedUsers={blockedUsers}
          onUnblock={async (id) => {
            await unblockUser(id);
            showToast({
              title: "User Unblocked",
              description: "User is unblocked and back in your friends list",
              type: "success",
            });
          }}
        />

        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />

        <ContactProfileModal
          isOpen={!!contactProfileToView}
          onClose={() => setContactProfileToView(null)}
          contact={contactProfileToView}
          isOnline={
            contactProfileToView
              ? Boolean(
                  !isBlocked(contactProfileToView.id) &&
                    !contactProfileToView.is_blocked &&
                    !(presenceMap[contactProfileToView.id]?.isHidden ??
                      (contactProfileToView.is_blocked_by ||
                        presenceMap[contactProfileToView.id]?.isBlockedBy)) &&
                    presenceMap[contactProfileToView.id]?.status === "online"
                )
              : false
          }
          lastSeen={
            contactProfileToView
              ? isBlocked(contactProfileToView.id) ||
                contactProfileToView.is_blocked ||
                (presenceMap[contactProfileToView.id]?.isHidden !== undefined
                  ? presenceMap[contactProfileToView.id]?.isHidden
                  : contactProfileToView.is_blocked_by ||
                    presenceMap[contactProfileToView.id]?.isBlockedBy)
                ? null
                : (presenceMap[contactProfileToView.id]?.lastSeen ??
                  contactProfileToView.last_seen)
              : null
          }
          isBlocked={
            contactProfileToView ? isBlocked(contactProfileToView.id) : false
          }
          isBlockedBy={
            contactProfileToView
              ? Boolean(
                  isBlocked(contactProfileToView.id) ||
                    contactProfileToView.is_blocked ||
                    (presenceMap[contactProfileToView.id]?.isHidden !== undefined
                      ? presenceMap[contactProfileToView.id]?.isHidden
                      : contactProfileToView.is_blocked_by ||
                        presenceMap[contactProfileToView.id]?.isBlockedBy)
                )
              : false
          }
          onBlockToggle={async () => {
            if (!contactProfileToView) return;
            const id = contactProfileToView.id;
            if (isBlocked(id)) {
              await unblockUser(id);
              showToast({
                title: "User Unblocked",
                description: `Unblocked ${contactProfileToView.name}`,
                type: "success",
              });
            } else {
              setUserToBlock({
                id: contactProfileToView.id,
                name: contactProfileToView.name,
              });
            }
          }}
        />

        <BlockUserModal
          isOpen={!!userToBlock}
          onClose={() => setUserToBlock(null)}
          user={userToBlock}
          onConfirmBlock={async (userId) => {
            await blockUser(userId);
            showToast({
              title: "User Blocked",
              description: `Blocked ${userToBlock?.name}`,
              type: "info",
            });
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
