"use client";

import React, { useRef, useEffect, UIEvent } from "react";
import { Message } from "@/types/message.types";
import { MessageBubble } from "./MessageBubble";
import { Loader2 } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  contactName?: string;
  contactAvatar?: string | null;
  isLoading: boolean;
  isLoadingOlder: boolean;
  hasMore: boolean;
  onLoadOlder: () => void;
  onEditMessage: (message: Message) => void;
  onDeleteForMe: (messageId: string) => void;
  onDeleteForEveryone: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  contactName = "User",
  contactAvatar,
  isLoading,
  isLoadingOlder,
  hasMore,
  onLoadOlder,
  onEditMessage,
  onDeleteForMe,
  onDeleteForEveryone,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeightRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);

  // Group messages by date
  const formatDateHeader = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  // Scroll to bottom on initial load
  useEffect(() => {
    if (messages.length > 0 && isInitialLoadRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      isInitialLoadRef.current = false;
    }
  }, [messages]);

  // Adjust scroll position after prepending older messages
  useEffect(() => {
    if (containerRef.current && previousScrollHeightRef.current > 0) {
      const heightDifference =
        containerRef.current.scrollHeight - previousScrollHeightRef.current;
      containerRef.current.scrollTop += heightDifference;
      previousScrollHeightRef.current = 0;
    }
  }, [messages]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop < 60 && hasMore && !isLoadingOlder && !isLoading) {
      previousScrollHeightRef.current = target.scrollHeight;
      onLoadOlder();
    }
  };

  // Auto-scroll to bottom if message was appended (e.g. by me or while near bottom)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (isNearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-1 sm:px-3 py-4 space-y-1"
    >
      {/* Loading older messages spinner */}
      {isLoadingOlder && (
        <div className="flex justify-center py-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-surface-100 rounded-full text-xs text-brand-light border border-card-border">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Loading older messages...</span>
          </div>
        </div>
      )}

      {/* Initial loading state */}
      {isLoading && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand mb-2" />
          <p className="text-sm">Loading chat history...</p>
        </div>
      )}

      {/* Empty messages state */}
      {!isLoading && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full py-20 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-surface-100 border border-card-border flex items-center justify-center text-brand-light mb-3 shadow-glow-sm">
            ✨
          </div>
          <h4 className="text-base font-semibold text-white mb-1">
            Say hello to {contactName}!
          </h4>
          <p className="text-xs text-slate-400 max-w-xs">
            Start a real-time conversation. Your messages are encrypted and delivered instantly.
          </p>
        </div>
      )}

      {/* Render messages with Date group separators */}
      {messages.map((message, index) => {
        const currentDateHeader = formatDateHeader(message.createdAt);
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const prevDateHeader = prevMessage
          ? formatDateHeader(prevMessage.createdAt)
          : null;
        const showDateSeparator = currentDateHeader !== prevDateHeader;

        const isMe = currentUserId === message.senderId;

        return (
          <React.Fragment key={message._id}>
            {showDateSeparator && (
              <div className="flex justify-center my-4">
                <span className="px-3.5 py-1 text-[11px] font-medium tracking-wide text-slate-400 bg-surface-100/90 border border-card-border/60 rounded-full shadow-sm">
                  {currentDateHeader}
                </span>
              </div>
            )}

            <MessageBubble
              message={message}
              isMe={isMe}
              senderName={isMe ? "You" : contactName}
              senderAvatar={isMe ? null : contactAvatar}
              onEdit={onEditMessage}
              onDeleteForMe={onDeleteForMe}
              onDeleteForEveryone={onDeleteForEveryone}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
};
