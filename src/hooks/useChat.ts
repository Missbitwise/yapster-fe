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
    sendReadConversationWs,
    sendEditWs,
    sendDeleteForMeWs,
    sendDeleteForEveryoneWs,
    subscribe,
    isConnected,
    setUnreadTotal,
    clearUnreadForContact,
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

      // Clear unread badge for this contact in sidebar and contacts list immediately
      clearUnreadForContact(activeContactId);

      // Only mark as read if the document/tab is currently visible
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }

      // Filter unread incoming messages from the active contact
      const unreadIncoming = msgList.filter(
        (m) =>
          String(m.receiverId) === String(currentUserId) &&
          String(m.senderId) === String(activeContactId) &&
          m.status !== "read" &&
          !m._id.startsWith("temp-")
      );

      // Optimistically mark them as read in local state
      if (unreadIncoming.length > 0) {
        setMessages((prev) =>
          prev.map((m) =>
            String(m.receiverId) === String(currentUserId) &&
            String(m.senderId) === String(activeContactId) &&
            m.status !== "read"
              ? { ...m, status: "read" }
              : m
          )
        );

        // Send individual read WS events (ensures compatibility with all backend versions)
        unreadIncoming.forEach((m) => {
          sendReadWs(m._id);
        });

        setUnreadTotal((prev) => Math.max(0, prev - unreadIncoming.length));
      }

      // Send conversation read event via WS
      sendReadConversationWs(activeContactId);
      // Also send HTTP fallback
      messageService.markConversationAsRead(activeContactId).catch(() => {});
    },
    [currentUserId, activeContactId, clearUnreadForContact, sendReadWs, sendReadConversationWs, setUnreadTotal]
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

        // Mark incoming messages as read and clear unread count
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
          (String(msg.senderId) === String(currentUserId) && String(msg.receiverId) === String(contactId)) ||
          (String(msg.senderId) === String(contactId) && String(msg.receiverId) === String(currentUserId));

        if (isCurrentConversation) {
          setMessages((prev) => {
            // Check if there is an optimistic temp message matching this content
            const tempIdx = prev.findIndex(
              (m) =>
                m._id.startsWith("temp-") &&
                m.content === msg.content &&
                String(m.senderId) === String(msg.senderId)
            );

            if (tempIdx !== -1) {
              const updated = [...prev];
              updated[tempIdx] = msg;
              return updated;
            }

            if (prev.some((m) => String(m._id) === String(msg._id))) {
              return prev.map((m) => (String(m._id) === String(msg._id) ? msg : m));
            }
            return [...prev, msg];
          });

          // If incoming from active contact and tab is currently visible, mark read immediately
          if (String(msg.senderId) === String(contactId) && String(msg.receiverId) === String(currentUserId)) {
            if (
              typeof document !== "undefined" &&
              document.visibilityState === "visible"
            ) {
              sendReadWs(msg._id);
              clearUnreadForContact(contactId);
              setUnreadTotal((prev) => Math.max(0, prev - 1));
            }
          }
        }
      }

      if (payload.type === "message_read") {
        const updated = payload.data;
        setMessages((prev) =>
          prev.map((m) =>
            String(m._id) === String(updated._id) ? { ...m, status: "read" } : m
          )
        );
      }

      if (payload.type === "message_edited") {
        const updated = payload.data;
        setMessages((prev) =>
          prev.map((m) =>
            String(m._id) === String(updated._id)
              ? { ...m, content: updated.content, editedAt: updated.editedAt }
              : m
          )
        );
      }

      if (payload.type === "message_deleted_for_me") {
        const { messageId } = payload.data;
        setMessages((prev) => prev.filter((m) => String(m._id) !== String(messageId)));
      }

      if (payload.type === "message_deleted_for_everyone") {
        const { messageId } = payload.data;
        setMessages((prev) => prev.filter((m) => String(m._id) !== String(messageId)));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe, currentUserId, sendReadWs, setUnreadTotal, clearUnreadForContact]);

  // Send message with instant optimistic update
  const sendMessage = async (content: string) => {
    if (!activeContactId || !content.trim() || !currentUserId) return;

    const trimmed = content.trim();
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const optimisticMsg: Message = {
      _id: tempId,
      conversationId: "",
      senderId: currentUserId,
      receiverId: activeContactId,
      content: trimmed,
      status: "sent",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedFor: [],
    };

    // Optimistically insert message immediately so UI shows single tick instantly
    setMessages((prev) => [...prev, optimisticMsg]);

    let sentWs = false;

    if (isConnected) {
      sentWs = sendMessageWs(activeContactId, trimmed);
    }

    if (!sentWs) {
      try {
        const res = await messageService.sendMessage(activeContactId, trimmed);
        if (res.success && res.data) {
          setMessages((prev) => {
            const hasTemp = prev.some((m) => m._id === tempId);
            if (hasTemp) {
              return prev.map((m) => (m._id === tempId ? res.data : m));
            }
            if (prev.some((m) => m._id === res.data._id)) return prev;
            return [...prev, res.data];
          });
        }
      } catch (err: any) {
        console.error("Failed to send message:", err);
        // Remove optimistic message if send failed
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
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
