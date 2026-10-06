"use client";

import React, { useState } from "react";
import { Friend } from "@/types/friend.types";
import { Message } from "@/types/message.types";
import { useChat } from "@/hooks/useChat";
import { useWebSocket } from "@/context/WebSocketContext";
import { useAuth } from "@/context/AuthContext";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { TypingIndicator } from "./TypingIndicator";
import { MessageInput } from "./MessageInput";
import { EditMessageModal } from "./EditMessageModal";
import { ShieldAlert } from "lucide-react";

interface ChatAreaProps {
  contact: Friend;
  isBlocked: boolean;
  onBlockToggle: () => void;
  onBackMobile?: () => void;
  onViewProfile?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  contact,
  isBlocked,
  onBlockToggle,
  onBackMobile,
  onViewProfile,
}) => {
  const { user } = useAuth();
  const {
    presenceMap,
    typingMap,
    sendTypingWs,
    sendStoppedTypingWs,
  } = useWebSocket();

  const {
    messages,
    isLoading,
    isLoadingOlder,
    hasMore,
    sendMessage,
    editMessage,
    deleteForMe,
    deleteForEveryone,
    loadOlderMessages,
  } = useChat(contact.id);

  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  const presence = presenceMap[contact.id];
  const isOnline = presence?.status === "online";
  const lastSeen = presence?.lastSeen !== undefined ? presence.lastSeen : contact.last_seen;
  const isTyping = !!typingMap[contact.id];

  const handleTyping = () => {
    if (!isBlocked) {
      sendTypingWs(contact.id);
    }
  };

  const handleStopTyping = () => {
    if (!isBlocked) {
      sendStoppedTypingWs(contact.id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Top Header */}
      <ChatHeader
        contactName={contact.name}
        contactUsername={contact.username}
        contactAvatar={contact.profile_picture}
        contactBio={contact.bio}
        isOnline={isOnline}
        lastSeen={lastSeen}
        isBlocked={isBlocked}
        onBackMobile={onBackMobile}
        onBlockToggle={onBlockToggle}
        onViewProfile={onViewProfile}
      />

      {/* Blocked Alert Banner if contact is blocked */}
      {isBlocked && (
        <div className="bg-rose-950/60 border-b border-rose-800/40 px-4 py-2 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>You have blocked this user. Messages cannot be sent or received.</span>
          </div>
          <button
            onClick={onBlockToggle}
            className="underline hover:text-white font-medium ml-2"
          >
            Unblock
          </button>
        </div>
      )}

      {/* Messages Stream with cursor pagination */}
      <MessageList
        messages={messages}
        currentUserId={user?.id}
        contactName={contact.name}
        contactAvatar={contact.profile_picture}
        isLoading={isLoading}
        isLoadingOlder={isLoadingOlder}
        hasMore={hasMore}
        onLoadOlder={loadOlderMessages}
        onEditMessage={(msg) => setEditingMessage(msg)}
        onDeleteForMe={deleteForMe}
        onDeleteForEveryone={deleteForEveryone}
      />

      {/* Real-time Typing Indicator */}
      {isTyping && !isBlocked && <TypingIndicator name={contact.name} />}

      {/* Pill Message Input Bar */}
      <MessageInput
        onSendMessage={sendMessage}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
        disabled={isBlocked}
        disabledPlaceholder={
          isBlocked
            ? "Unblock this user to send a message"
            : "Type your message..."
        }
      />

      {/* Edit message modal */}
      <EditMessageModal
        isOpen={!!editingMessage}
        onClose={() => setEditingMessage(null)}
        message={editingMessage}
        onSave={async (messageId, content) => {
          await editMessage(messageId, content);
        }}
      />
    </div>
  );
};
