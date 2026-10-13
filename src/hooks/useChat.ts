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

  const markMessagesAsRead = useCallback(
    (msgList: Message[]) => {
      if (!currentUserId || !activeContactId) return;

      clearUnreadForContact(activeContactId);

      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }

      const unreadIncoming = msgList.filter(
        (m) =>
          String(m.receiverId) === String(currentUserId) &&
          String(m.senderId) === String(activeContactId) &&
          m.status !== "read" &&
          !m._id.startsWith("temp-")
      );

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

        unreadIncoming.forEach((m) => {
          sendReadWs(m._id);
        });

        setUnreadTotal((prev) => Math.max(0, prev - unreadIncoming.length));
      }

      sendReadConversationWs(activeContactId);
      messageService
        .markConversationAsRead(activeContactId)
        .then((res) => {
          if (!res.success || !res.data) return;

          clearUnreadForContact(activeContactId);
          setUnreadTotal(res.data.totalUnread);
          console.info("[chat:read] server confirmed conversation read", {
            contactId: activeContactId,
            readCount: res.data.readCount,
            totalUnread: res.data.totalUnread,
          });
        })
        .catch((err: any) => {
          console.error("[chat:read] request failed", {
            contactId: activeContactId,
            status: err.response?.status,
            response: err.response?.data,
            message: err.message,
          });
        });
    },
    [currentUserId, activeContactId, clearUnreadForContact, sendReadWs, sendReadConversationWs, setUnreadTotal]
  );

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
        console.info("[chat:history] loaded", {
          contactId: activeContactId,
          count: fetchedMessages.length,
          ids: fetchedMessages.map((message) => message._id),
        });
        setMessages(fetchedMessages);
        setNextCursor(res.data.nextCursor);
        setHasMore(res.data.hasMore);

        markMessagesAsRead(fetchedMessages);
      }
    } catch (err: any) {
      console.error("Failed to load messages:", err);
      console.error("[chat:history] request failed", {
        contactId: activeContactId,
        status: err.response?.status,
        response: err.response?.data,
        message: err.message,
      });
      setError(err.response?.data?.message || "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [activeContactId, markMessagesAsRead]);

  useEffect(() => {
    loadInitialMessages();
  }, [loadInitialMessages]);

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

  useEffect(() => {
    const unsubscribe = subscribe((payload: IncomingWebSocketPayload) => {
      const contactId = activeContactIdRef.current;
      if (!currentUserId || !contactId) return;

      if (payload.type === "message") {
        const msg = payload.data;
        console.info("[chat:message] websocket message received", {
          id: msg._id,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          status: msg.status,
          deletedForCurrentUser: msg.deletedFor?.includes(currentUserId),
        });
        const isCurrentConversation =
          (String(msg.senderId) === String(currentUserId) && String(msg.receiverId) === String(contactId)) ||
          (String(msg.senderId) === String(contactId) && String(msg.receiverId) === String(currentUserId));

        if (isCurrentConversation) {
          setMessages((prev) => {
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

    setMessages((prev) => [...prev, optimisticMsg]);
    console.info("[chat:send] optimistic message shown", {
      tempId,
      senderId: currentUserId,
      receiverId: activeContactId,
      transport: isConnected ? "websocket" : "http",
    });

    let sentWs = false;

    if (isConnected) {
      sentWs = sendMessageWs(activeContactId, trimmed);
      console.info("[chat:send] websocket frame queued", {
        tempId,
        receiverId: activeContactId,
        queued: sentWs,
      });
    }

    if (!sentWs) {
      try {
        const res = await messageService.sendMessage(activeContactId, trimmed);
        if (res.success && res.data) {
          console.info("[chat:send] http save confirmed", {
            tempId,
            messageId: res.data._id,
            status: res.data.status,
          });
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
        console.error("[chat:send] http request failed", {
          tempId,
          receiverId: activeContactId,
          status: err.response?.status,
          response: err.response?.data,
          message: err.message,
        });
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
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
  };

  const deleteForEveryone = async (messageId: string) => {
    sendDeleteForEveryoneWs(messageId);
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
