import { apiClient } from "./api.client";
import { ApiResponse } from "@/types/user.types";
import { Message, MessageStatus, PaginatedMessages } from "@/types/message.types";

export const messageService = {
  async getConversationMessages(
    userId: string,
    limit: number = 50,
    cursor?: string | null
  ): Promise<ApiResponse<PaginatedMessages>> {
    const params: Record<string, any> = { limit };
    if (cursor) {
      params.cursor = cursor;
    }
    const res = await apiClient.get<ApiResponse<PaginatedMessages>>(
      `/messages/${userId}`,
      { params }
    );
    return res.data;
  },

  async sendMessage(
    receiverId: string,
    content: string
  ): Promise<ApiResponse<Message>> {
    const res = await apiClient.post<ApiResponse<Message>>("/messages", {
      receiverId,
      content,
    });
    return res.data;
  },

  async updateMessageStatus(
    messageId: string,
    status: MessageStatus
  ): Promise<ApiResponse<Message>> {
    const res = await apiClient.patch<ApiResponse<Message>>(
      `/messages/${messageId}/status`,
      { status }
    );
    return res.data;
  },
};
