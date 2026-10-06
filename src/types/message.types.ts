export type MessageStatus = "sent" | "delivered" | "read";

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: MessageStatus;
  deletedFor: string[];
  editedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedMessages {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ConversationSummary {
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    profile_picture?: string | null;
    bio?: string | null;
  };
  lastMessage?: Message;
  unreadCount: number;
}
