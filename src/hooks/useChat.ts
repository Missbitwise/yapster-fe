"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Message } from "@/types/message.types";
import { messageService } from "@/services/message.service";
import { useWebSocket } from "@/context/WebSocketContext";
import { useAuth } from "@/context/AuthContext";
import { IncomingWebSocketPayload } from "@/types/websocket.types";

export const useChat = (activeContactId: string | null) => {
  const { user } = useAuth();
  const {
    sendMessageWs,
    sendReadWs,
    sendEditWs,
    sendDeleteForMeWs,
    sendDeleteForEveryoneWs,
    subscribe,
    isConnected,
    setUnreadTotal,
  } = useWebSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activeContactIdRef = useRef<string | null>(activeContactId);
  activeContactIdRef.current = activeContactId;

  const currentUserId = user?.id;

  // Mark all unread messages received from the active contact as read
  const markMessagesAsRead = useCallback(
    (msgList: Message[]) => {
      if (!currentUserId || !activeContactId) return;

      // Only mark as read if the document/tab is currently visible
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }

      msgList.forEach((msg) => {
        if (
          msg.receiverId === currentUserId &&
          msg.senderId === activeContactId &&
          msg.status !== "read"
        ) {
          sendReadWs(msg._id);
        }
      });
    },
    [currentUserId, activeContactId, sendReadWs]
  );

  // When user returns to this tab / window, mark any unread messages as read
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        setMessages((current) => {
          markMessagesAsRead(current);
          return current;
        });
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    return () => {
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [markMessagesAsRead]);

  // Load initial messages for active conversation
  const loadInitialMessages = useCallback(async () => {
    if (!activeContactId) {
      setMessages([]);
      setNextCursor(null);
      setHasMore(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await messageService.getConversationMessages(
        activeContactId,
        50
      );
      if (res.success && res.data) {
        const fetchedMessages = res.data.messages || [];
        setMessages(fetchedMessages);
        setNextCursor(res.data.nextCursor);
        setHasMore(res.data.hasMore);

        // Mark incoming messages as read
        markMessagesAsRead(fetchedMessages);
      }
    } catch (err: any) {
      console.error("Failed to load messages:", err);
      setError(err.response?.data?.message || "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [activeContactId, markMessagesAsRead]);

  useEffect(() => {
    loadInitialMessages();
  }, [loadInitialMessages]);

  // Load older messages for cursor pagination when scrolling to top
  const loadOlderMessages = useCallback(async () => {
    if (
      !activeContactId ||
      !hasMore ||
      !nextCursor ||
      isLoadingOlder ||
      isLoading
    ) {
      return;
    }

    setIsOlderMessagesLoading(true);
    try {
      const res = await messageService.getConversationMessages(
        activeContactId,
        50,
        nextCursor
      );

      if (res.success && res.data) {
        const older = res.data.messages || [];
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m._id));
          const uniqueOlder = older.filter((m) => !existingIds.has(m._id));
          return [...uniqueOlder, ...prev];
        });
        setNextCursor(res.data.nextCursor);
        setHasMore(res.data.hasMore);
      }
    } catch (err) {
      console.error("Failed to load older messages:", err);
    } finally {
      setIsOlderMessagesLoading(false);
    }
  }, [activeContactId, hasMore, nextCursor, isLoadingOlder, isLoading]);

  function setIsOlderMessagesLoading(val: boolean) {
    setIsLoadingOlder(val);
  }

  // Handle incoming websocket events
  useEffect(() => {
    const unsubscribe = subscribe((payload: IncomingWebSocketPayload) => {
      const contactId = activeContactIdRef.current;
      if (!currentUserId || !contactId) return;

      if (payload.type === "message") {
        const msg = payload.data;
        const isCurrentConversation =
          (msg.senderId === currentUserId && msg.receiverId === contactId) ||
          (msg.senderId === contactId && msg.receiverId === currentUserId);

        if (isCurrentConversation) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === msg._id)) {
              return prev.map((m) => (m._id === msg._id ? msg : m));
            }
            return [...prev, msg];
          });

          // If incoming from active contact and tab is currently visible, mark read
          if (msg.senderId === contactId && msg.receiverId === currentUserId) {
            if (
              typeof document !== "undefined" &&
              document.visibilityState === "visible"
            ) {
              sendReadWs(msg._id);
              setUnreadTotal((prev) => Math.max(0, prev - 1));
            }
          }
        }
      }

      if (payload.type === "message_read") {
        const updated = payload.data;
        setMessages((prev) =>
          prev.map((m) =>
            m._id === updated._id ? { ...m, status: "read" } : m
          )
        );
      }

      if (payload.type === "message_edited") {
        const updated = payload.data;
        setMessages((prev) =>
          prev.map((m) =>
            m._id === updated._id
              ? { ...m, content: updated.content, editedAt: updated.editedAt }
              : m
          )
        );
      }

      if (payload.type === "message_deleted_for_me") {
        const { messageId } = payload.data;
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }

      if (payload.type === "message_deleted_for_everyone") {
        const { messageId } = payload.data;
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe, currentUserId, sendReadWs, setUnreadTotal]);

  // Send message
  const sendMessage = async (content: string) => {
    if (!activeContactId || !content.trim()) return;

    const trimmed = content.trim();
    let sentWs = false;

    if (isConnected) {
      sentWs = sendMessageWs(activeContactId, trimmed);
    }

    if (!sentWs) {
      try {
        const res = await messageService.sendMessage(activeContactId, trimmed);
        if (res.success && res.data) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === res.data._id)) return prev;
            return [...prev, res.data];
          });
        }
      } catch (err: any) {
        console.error("Failed to send message:", err);
        setError(err.response?.data?.message || err.message || "Failed to send message");
      }
    }
  };

  const editMessage = async (messageId: string, content: string) => {
    sendEditWs(messageId, content.trim());
  };

  const deleteForMe = async (messageId: string) => {
    sendDeleteForMeWs(messageId);
    // Optimistic removal
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
  };

  const deleteForEveryone = async (messageId: string) => {
    sendDeleteForEveryoneWs(messageId);
    // Optimistic removal
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
  };

  return {
    messages,
    isLoading,
    isLoadingOlder,
    hasMore,
    error,
    sendMessage,
    editMessage,
    deleteForMe,
    deleteForEveryone,
    loadOlderMessages,
    reloadMessages: loadInitialMessages,
  };
};
