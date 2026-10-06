"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { Message } from "@/types/message.types";
import {
  IncomingWebSocketPayload,
  OutgoingWebSocketPayload,
} from "@/types/websocket.types";

type WebSocketEventHandler = (payload: IncomingWebSocketPayload) => void;

export interface PresenceInfo {
  status: "online" | "offline";
  lastSeen?: string | null;
}

interface WebSocketContextType {
  isConnected: boolean;
  presenceMap: Record<string, PresenceInfo>;
  typingMap: Record<string, boolean>;
  unreadTotal: number;
  setUnreadTotal: React.Dispatch<React.SetStateAction<number>>;
  sendMessageWs: (receiverId: string, content: string) => boolean;
  sendTypingWs: (receiverId: string) => boolean;
  sendStoppedTypingWs: (receiverId: string) => boolean;
  sendReadWs: (messageId: string) => boolean;
  sendEditWs: (messageId: string, content: string) => boolean;
  sendDeleteForMeWs: (messageId: string) => boolean;
  sendDeleteForEveryoneWs: (messageId: string) => boolean;
  subscribe: (handler: WebSocketEventHandler) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL || "wss://yapster-be.onrender.com";

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, user } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [presenceMap, setPresenceMap] = useState<
    Record<string, PresenceInfo>
  >({});
  const [typingMap, setTypingMap] = useState<Record<string, boolean>>({});
  const [unreadTotal, setUnreadTotal] = useState<number>(0);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptRef = useRef<number>(0);
  const subscribersRef = useRef<Set<WebSocketEventHandler>>(new Set());
  const typingTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  const subscribe = useCallback((handler: WebSocketEventHandler) => {
    subscribersRef.current.add(handler);
    return () => {
      subscribersRef.current.delete(handler);
    };
  }, []);

  const sendPayload = useCallback(
    (payload: OutgoingWebSocketPayload): boolean => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.send(JSON.stringify(payload));
        return true;
      }
      return false;
    },
    []
  );

  const sendMessageWs = useCallback(
    (receiverId: string, content: string) => {
      return sendPayload({ type: "message", receiverId, content });
    },
    [sendPayload]
  );

  const sendTypingWs = useCallback(
    (receiverId: string) => {
      return sendPayload({ type: "typing", receiverId });
    },
    [sendPayload]
  );

  const sendStoppedTypingWs = useCallback(
    (receiverId: string) => {
      return sendPayload({ type: "stopped_typing", receiverId });
    },
    [sendPayload]
  );

  const sendReadWs = useCallback(
    (messageId: string) => {
      return sendPayload({ type: "read", messageId });
    },
    [sendPayload]
  );

  const sendEditWs = useCallback(
    (messageId: string, content: string) => {
      return sendPayload({ type: "edit", messageId, content });
    },
    [sendPayload]
  );

  const sendDeleteForMeWs = useCallback(
    (messageId: string) => {
      return sendPayload({ type: "delete_for_me", messageId });
    },
    [sendPayload]
  );

  const sendDeleteForEveryoneWs = useCallback(
    (messageId: string) => {
      return sendPayload({ type: "delete_for_everyone", messageId });
    },
    [sendPayload]
  );

  const connect = useCallback(() => {
    if (!token || !user) return;
    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    try {
      const wsUrl = `${WS_BASE_URL}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttemptRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as IncomingWebSocketPayload;

          // Internal presence handling
          if (payload.type === "presence") {
            setPresenceMap((prev) => ({
              ...prev,
              [payload.userId]: {
                status: payload.status,
                lastSeen:
                  payload.lastSeen !== undefined
                    ? payload.lastSeen
                    : prev[payload.userId]?.lastSeen,
              },
            }));
          }

          // Unread count update from server on connection
          if (payload.type === "unread_count") {
            setUnreadTotal(payload.data.totalUnread);
          }

          // Typing indicators
          if (payload.type === "typing") {
            setTypingMap((prev) => ({
              ...prev,
              [payload.userId]: true,
            }));

            // Auto-clear typing indicator after 4 seconds of no update
            if (typingTimeoutsRef.current[payload.userId]) {
              clearTimeout(typingTimeoutsRef.current[payload.userId]);
            }
            typingTimeoutsRef.current[payload.userId] = setTimeout(() => {
              setTypingMap((prev) => ({
                ...prev,
                [payload.userId]: false,
              }));
            }, 4000);
          }

          if (payload.type === "stopped_typing") {
            setTypingMap((prev) => ({
              ...prev,
              [payload.userId]: false,
            }));
            if (typingTimeoutsRef.current[payload.userId]) {
              clearTimeout(typingTimeoutsRef.current[payload.userId]);
            }
          }

          // Broadcast to all active subscribers
          subscribersRef.current.forEach((handler) => {
            try {
              handler(payload);
            } catch (err) {
              console.error("Subscriber handler error:", err);
            }
          });
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        socketRef.current = null;

        // Do not auto-reconnect if closed deliberately (code 1000) or unauthorized (code 1008)
        if (event.code !== 1000 && event.code !== 1008 && token) {
          const backoff = Math.min(
            1000 * Math.pow(1.5, reconnectAttemptRef.current),
            10000
          );
          reconnectAttemptRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, backoff);
        }
      };

      ws.onerror = (err) => {
        console.warn("WebSocket error:", err);
      };
    } catch (err) {
      console.error("Failed to initialize WebSocket:", err);
    }
  }, [token, user]);

  useEffect(() => {
    if (token && user) {
      connect();
    } else {
      if (socketRef.current) {
        socketRef.current.close(1000, "User logged out");
        socketRef.current = null;
      }
      setIsConnected(false);
      setPresenceMap({});
      setTypingMap({});
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close(1000, "Provider unmounted");
        socketRef.current = null;
      }
    };
  }, [token, user, connect]);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        presenceMap,
        typingMap,
        unreadTotal,
        setUnreadTotal,
        sendMessageWs,
        sendTypingWs,
        sendStoppedTypingWs,
        sendReadWs,
        sendEditWs,
        sendDeleteForMeWs,
        sendDeleteForEveryoneWs,
        subscribe,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
