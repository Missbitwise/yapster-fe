import { Message } from "./message.types";

export type OutgoingWebSocketPayload =
  | {
      type: "message";
      receiverId: string;
      content: string;
    }
  | {
      type: "typing";
      receiverId: string;
    }
  | {
      type: "stopped_typing";
      receiverId: string;
    }
  | {
      type: "read";
      messageId: string;
    }
  | {
      type: "edit";
      messageId: string;
      content: string;
    }
  | {
      type: "delete_for_me";
      messageId: string;
    }
  | {
      type: "delete_for_everyone";
      messageId: string;
    };

export type IncomingWebSocketPayload =
  | {
      type: "connection";
      message: string;
    }
  | {
      type: "unread_count";
      data: {
        totalUnread: number;
      };
    }
  | {
      type: "presence";
      userId: string;
      status: "online" | "offline";
      lastSeen?: string | null;
    }
  | {
      type: "message";
      data: Message;
    }
  | {
      type: "typing";
      userId: string;
    }
  | {
      type: "stopped_typing";
      userId: string;
    }
  | {
      type: "message_read";
      data: Message;
    }
  | {
      type: "message_edited";
      data: Message;
    }
  | {
      type: "message_deleted_for_me";
      data: {
        messageId: string;
      };
    }
  | {
      type: "message_deleted_for_everyone";
      data: {
        messageId: string;
      };
    }
  | {
      type: "error";
      message: string;
    };
