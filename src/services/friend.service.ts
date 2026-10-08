import { apiClient } from "./api.client";
import { ApiResponse } from "@/types/user.types";
import { BlockedUser, Friend, FriendRequest } from "@/types/friend.types";

export const friendService = {
  async getMyFriends(): Promise<ApiResponse<Friend[]>> {
    const res = await apiClient.get<ApiResponse<Friend[]>>("/friends");
    return res.data;
  },

  async sendFriendRequest(receiverId: string): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>(
      `/friends/requests/${receiverId}`
    );
    return res.data;
  },

  async getReceivedRequests(): Promise<ApiResponse<FriendRequest[]>> {
    const res = await apiClient.get<ApiResponse<FriendRequest[]>>(
      "/friends/requests"
    );
    return res.data;
  },

  async getSentRequests(): Promise<ApiResponse<FriendRequest[]>> {
    const res = await apiClient.get<ApiResponse<FriendRequest[]>>(
      "/friends/requests/sent"
    );
    return res.data;
  },

  async cancelFriendRequest(
    requestIdOrReceiverId: string
  ): Promise<ApiResponse<any>> {
    const res = await apiClient.delete<ApiResponse<any>>(
      `/friends/requests/${requestIdOrReceiverId}`
    );
    return res.data;
  },

  async respondRequest(
    requestId: string,
    action: "accept" | "reject"
  ): Promise<ApiResponse<any>> {
    const res = await apiClient.patch<ApiResponse<any>>(
      `/friends/requests/${requestId}`,
      { action }
    );
    return res.data;
  },

  async blockUser(userId: string): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>(`/friends/block/${userId}`);
    return res.data;
  },

  async unblockUser(userId: string): Promise<ApiResponse<any>> {
    const res = await apiClient.delete<ApiResponse<any>>(
      `/friends/block/${userId}`
    );
    return res.data;
  },

  async getBlockedUsers(): Promise<ApiResponse<BlockedUser[]>> {
    const res = await apiClient.get<ApiResponse<BlockedUser[]>>(
      "/friends/blocked"
    );
    return res.data;
  },
};
