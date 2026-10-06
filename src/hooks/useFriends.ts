"use client";

import { useState, useEffect, useCallback } from "react";
import { Friend, FriendRequest, BlockedUser } from "@/types/friend.types";
import { friendService } from "@/services/friend.service";
import { useAuth } from "@/context/AuthContext";

export const useFriends = () => {
  const { isAuthenticated } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setError(null);
      const res = await friendService.getMyFriends();
      if (res.success && Array.isArray(res.data)) {
        setFriends(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load friends", err);
      setError(err.response?.data?.message || "Failed to load friends");
    }
  }, [isAuthenticated]);

  const fetchRequests = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await friendService.getReceivedRequests();
      if (res.success && Array.isArray(res.data)) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error("Failed to load friend requests", err);
    }
  }, [isAuthenticated]);

  const fetchBlocked = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await friendService.getBlockedUsers();
      if (res.success && Array.isArray(res.data)) {
        setBlockedUsers(res.data);
      }
    } catch (err) {
      console.error("Failed to load blocked users", err);
    }
  }, [isAuthenticated]);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchFriends(), fetchRequests(), fetchBlocked()]);
    setIsLoading(false);
  }, [fetchFriends, fetchRequests, fetchBlocked]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    }
  }, [isAuthenticated, refreshAll]);

  const sendRequest = async (receiverId: string) => {
    const res = await friendService.sendFriendRequest(receiverId);
    await fetchRequests();
    return res;
  };

  const respondRequest = async (
    requestId: string,
    action: "accept" | "reject"
  ) => {
    const res = await friendService.respondRequest(requestId, action);
    // Optimistically update requests list
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    if (action === "accept") {
      await fetchFriends();
    }
    return res;
  };

  const blockUser = async (userId: string) => {
    const res = await friendService.blockUser(userId);
    // Remove from friends list immediately
    setFriends((prev) => prev.filter((f) => f.id !== userId));
    await fetchBlocked();
    return res;
  };

  const unblockUser = async (userId: string) => {
    const res = await friendService.unblockUser(userId);
    // Remove from blocked list immediately
    setBlockedUsers((prev) => prev.filter((b) => b.id !== userId));
    return res;
  };

  const isFriend = (userId: string) => friends.some((f) => f.id === userId);
  const isBlocked = (userId: string) =>
    blockedUsers.some((b) => b.id === userId);

  return {
    friends,
    requests,
    blockedUsers,
    isLoading,
    error,
    refreshAll,
    fetchFriends,
    fetchRequests,
    fetchBlocked,
    sendRequest,
    respondRequest,
    blockUser,
    unblockUser,
    isFriend,
    isBlocked,
  };
};
