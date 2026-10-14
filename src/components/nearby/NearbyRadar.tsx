"use client";

import React, { useState } from "react";
import { useNearby } from "@/hooks/useNearby";
import { Avatar } from "@/components/ui/Avatar";
import { Friend, FriendRequest } from "@/types/friend.types";
import { useToast } from "@/context/ToastContext";
import {
  Compass,
  Globe2,
  MapPin,
  Navigation,
  UserPlus,
  UserX,
  MessageCircle,
  Loader2,
  Sliders,
  ShieldAlert,
} from "lucide-react";
import { BlockUserModal } from "../friends/BlockUserModal";

interface NearbyRadarProps {
  friends: Friend[];
  sentRequests?: FriendRequest[];
  onOpenChat: (contact: Friend) => void;
  onSendFriendRequest: (userId: string) => Promise<any>;
  onCancelFriendRequest?: (requestIdOrUserId: string) => Promise<any>;
  onBlockUser: (userId: string) => Promise<any>;
  isBlocked?: (userId: string) => boolean;
  receivedRequests?: FriendRequest[];
}

export const NearbyRadar: React.FC<NearbyRadarProps> = ({
  friends,
  sentRequests = [],
  onOpenChat,
  onSendFriendRequest,
  onCancelFriendRequest,
  onBlockUser,
  isBlocked,
  receivedRequests = [],
}) => {
  const {
    radius,
    setRadius,
    nearbyUsers,
    everyoneUsers,
    everyonePage,
    hasMoreEveryone,
    isLoading,
    isLoadingEveryone,
    isLoadingLocation,
    isUpdatingLocation,
    error,
    locationError,
    hasLocation,
    currentLocality,
    detectLocation,
    refreshLocation,
    updateLocation,
    fetchNearby,
    fetchEveryone,
  } = useNearby(10);

  const { showToast } = useToast();
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [showManualForm, setShowManualForm] = useState(false);
  const [discoveryMode, setDiscoveryMode] = useState<"nearby" | "everyone">("nearby");
  const [requestedUserIds, setRequestedUserIds] = useState<Set<string>>(
    new Set()
  );
  const [userToBlock, setUserToBlock] = useState<{ id: string; name: string } | null>(null);

  const friendIdSet = new Set(friends.map((f) => f.id));

  const sentRequestMap = React.useMemo(() => {
    const map = new Map<string, string>();
    sentRequests?.forEach((req) => {
      if (req.receiver_id) map.set(req.receiver_id, req.id);
    });
    return map;
  }, [sentRequests]);

  const receivedRequestIds = React.useMemo(
    () => new Set(receivedRequests.map((request) => request.sender_id).filter(Boolean)),
    [receivedRequests]
  );

  const visibleUsers = React.useMemo(() => {
    const users = discoveryMode === "nearby" ? nearbyUsers : everyoneUsers;
    return users.filter((user) => !isBlocked?.(user.id));
  }, [discoveryMode, nearbyUsers, everyoneUsers, isBlocked]);
  const visibleError = error || (discoveryMode === "nearby" ? locationError : null);

  const handleCancelRequest = async (userId: string, userName: string) => {
    if (!onCancelFriendRequest) return;
    try {
      const reqId = sentRequestMap.get(userId) || userId;
      setRequestedUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      await onCancelFriendRequest(reqId);
      showToast({
        title: "Request Cancelled",
        description: `Cancelled friend request to ${userName}`,
        type: "info",
      });
    } catch (err: any) {
      showToast({
        title: "Could Not Cancel Request",
        description: err.response?.data?.message || err.message,
        type: "info",
      });
    }
  };

  const handleSendRequest = async (userId: string, userName: string) => {
    try {
      setRequestedUserIds((prev) => new Set(prev).add(userId));
      await onSendFriendRequest(userId);
      showToast({
        title: "Friend Request Sent",
        description: `Sent friend request to ${userName}`,
        type: "success",
      });
    } catch (err: any) {
      showToast({
        title: "Could Not Send Request",
        description: err.response?.data?.message || err.message,
        type: "info",
      });
    }
  };

  const handleManualLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng)) {
      alert("Please enter valid latitude and longitude numbers");
      return;
    }
    try {
      await updateLocation(lat, lng, manualCity || undefined);
      setShowManualForm(false);
      setManualLat("");
      setManualLng("");
      setManualCity("");
    } catch {
      return;
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-300 p-4 sm:p-6 overflow-y-auto">

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-card via-surface-100 to-card border border-card-border p-6 shadow-xl mb-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-light text-xs font-semibold uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4 animate-spin-slow text-brand" />
              <span>{discoveryMode === "nearby" ? "People In Your Area" : "Yapster Community"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {discoveryMode === "nearby" ? "Discover Friends Nearby" : "Discover Everyone"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md">
              {discoveryMode === "nearby"
                ? "Find friendly people around your neighborhood or city. Connect and start chatting!"
                : "Explore people across cities and regions, wherever they are."}
            </p>
            {currentLocality && (
              <div className="flex items-center gap-1.5 mt-2.5 text-xs text-emerald-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>Your Current Area: {currentLocality}</span>
              </div>
            )}
          </div>


          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex rounded-2xl border border-card-border bg-surface-100 p-1" role="tablist" aria-label="Discovery mode">
              <button
                role="tab"
                aria-selected={discoveryMode === "nearby"}
                onClick={() => {
                  setDiscoveryMode("nearby");
                  if (hasLocation) void fetchNearby(radius);
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${discoveryMode === "nearby" ? "bg-brand text-white" : "text-slate-300"}`}
              >
                <Compass className="h-3.5 w-3.5" /> Nearby
              </button>
              <button
                role="tab"
                aria-selected={discoveryMode === "everyone"}
                onClick={() => {
                  setDiscoveryMode("everyone");
                  if (everyonePage === 0) void fetchEveryone(1);
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${discoveryMode === "everyone" ? "bg-brand text-white" : "text-slate-300"}`}
              >
                <Globe2 className="h-3.5 w-3.5" /> Everyone
              </button>
            </div>

            {discoveryMode === "nearby" && (
              <>
                <button
                  onClick={() => void detectLocation().catch(() => undefined)}
                  disabled={isUpdatingLocation}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand text-white text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {isUpdatingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                  <span>{isUpdatingLocation ? "Finding Your Area..." : hasLocation ? "Update My Location" : "Enable Location"}</span>
                </button>
                <button
                  onClick={() => setShowManualForm(!showManualForm)}
                  className="px-3.5 py-2.5 rounded-2xl bg-surface-100 border border-card-border text-slate-300 text-xs font-medium transition-colors"
                >
                  Set City Manually
                </button>
              </>
            )}
          </div>
        </div>
      </div>


      {showManualForm && discoveryMode === "nearby" && (
        <form
          onSubmit={handleManualLocationSubmit}
          className="bg-card border border-card-border rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3 animate-in fade-in"
        >
          <input
            type="number"
            step="any"
            placeholder="Latitude (e.g. 19.0760)"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-100 border border-card-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand"
            required
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude (e.g. 72.8777)"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-100 border border-card-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand"
            required
          />
          <input
            type="text"
            placeholder="Locality / City Name"
            value={manualCity}
            onChange={(e) => setManualCity(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-100 border border-card-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={isUpdatingLocation}
            className="px-4 py-2 bg-brand text-white rounded-xl text-xs font-semibold  transition-colors"
          >
            Save Location
          </button>
        </form>
      )}


      {discoveryMode === "nearby" && <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-200/80 border border-card-border rounded-2xl px-4 py-3 mb-6">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <Sliders className="w-4 h-4 text-brand-light" />
          <span>Find people within:</span>
          <span className="font-bold text-brand-light text-sm">
            {radius} km
          </span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="100"
            value={radius}
            onChange={(e) => {
              const val = Number(e.target.value);
              setRadius(val);
              fetchNearby(val);
            }}
            className="w-48 sm:w-64 accent-brand cursor-pointer"
          />
          <button
            onClick={() => fetchNearby(radius)}
            className="px-3 py-1 bg-surface-100  border border-card-border rounded-xl text-xs text-slate-300  transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
      }


      {visibleError && (
        <div className="bg-amber-950/40 border border-amber-700/50 rounded-2xl p-4 text-xs text-amber-200 mb-6 flex items-center justify-between">
          <span>{visibleError}</span>
          {(
            discoveryMode === "everyone" ||
            (discoveryMode === "nearby" && (!hasLocation || Boolean(visibleError)))
          ) && (
            <button
              onClick={() => {
                if (discoveryMode === "everyone") {
                  void fetchEveryone(everyonePage > 0 ? everyonePage + 1 : 1, everyonePage > 0);
                } else if (hasLocation) {
                  void fetchNearby(radius);
                } else {
                  void refreshLocation();
                }
              }}
              className="underline font-semibold ml-2"
            >
              Retry
            </button>
          )}
        </div>
      )}


      {((discoveryMode === "nearby" && isLoadingLocation) || (discoveryMode === "nearby" ? isLoading : isLoadingEveryone)) ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand mb-2" />
          <p className="text-xs">{discoveryMode === "nearby" && isLoadingLocation ? "Loading your saved location..." : discoveryMode === "nearby" ? `Scanning within ${radius} km...` : "Loading Yapster users..."}</p>
        </div>
      ) : discoveryMode === "nearby" && !hasLocation ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 bg-surface-200/40 border border-card-border/60 rounded-3xl p-8">
          <MapPin className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">Share your location to find nearby people</h3>
          <p className="text-xs max-w-sm mb-4">Your saved location is loaded from your Yapster account and stays available when you move between screens.</p>
          <button onClick={() => void detectLocation().catch(() => undefined)} disabled={isUpdatingLocation} className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-semibold disabled:opacity-50">
            {isUpdatingLocation ? "Getting location..." : "Use my current location"}
          </button>
        </div>
      ) : visibleUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 bg-surface-200/40 border border-card-border/60 rounded-3xl p-8">
          {discoveryMode === "nearby" ? <Compass className="w-12 h-12 text-slate-600 mb-3" /> : <Globe2 className="w-12 h-12 text-slate-600 mb-3" />}
          <h3 className="text-base font-semibold text-white mb-1">
            {discoveryMode === "nearby" ? `No users detected within ${radius} km` : "No other users found"}
          </h3>
          <p className="text-xs max-w-sm mb-4">
            {discoveryMode === "nearby"
              ? "Try expanding the search radius slider or invite people in your area to share their location."
              : "There are no other discoverable Yapster users right now."}
          </p>
          {discoveryMode === "nearby" && <button
            onClick={() => {
              setRadius(50);
              fetchNearby(50);
            }}
            className="px-4 py-2 rounded-xl bg-surface-100 border border-card-border text-xs text-brand-light   transition-colors"
          >
            Expand to 50 km
          </button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleUsers.map((user) => {
              const isAlreadyFriend = friendIdSet.has(user.id) || user.relationship_status === "friend";
              const isRequested = requestedUserIds.has(user.id) || sentRequestMap.has(user.id) || user.relationship_status === "request_sent";
              const hasReceivedRequest = receivedRequestIds.has(user.id) || user.relationship_status === "request_received";
              const locality = user.locality?.trim();
              const hasDisplayableLocality = Boolean(
                locality && !["current location", "nearby", "my city", "custom location"].includes(locality.toLowerCase())
              );

              return (
                <div
                  key={user.id}
                  className="bg-card border border-card-border  rounded-3xl p-5 shadow-lg flex flex-col justify-between transition-all group "
                >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <Avatar
                      src={user.profile_picture}
                      name={user.name}
                      size="lg"
                      ringColor="purple"
                    />

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand/15 text-brand-light border border-brand/30">
                      <MapPin className="w-3 h-3" />
                      {discoveryMode === "nearby" && "distance_km" in user
                        ? `${user.distance_km} km`
                        : hasDisplayableLocality ? locality : "Location not provided"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white  transition-colors truncate">
                    {user.name}
                  </h3>
                  <p className="text-xs text-slate-400 mb-2 truncate">
                    @{user.username}
                  </p>

                  {discoveryMode === "nearby" && user.locality && (
                    <p className="text-xs text-slate-300 flex items-center gap-1 mb-2">
                      <span className="text-slate-500">Area:</span>
                      <span>{user.locality}</span>
                    </p>
                  )}

                  {user.bio && (
                    <p className="text-xs text-slate-400 line-clamp-2 italic">
                      &quot;{user.bio}&quot;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-card-border/60">
                  {isAlreadyFriend ? (
                    <button
                      onClick={() =>
                        onOpenChat({
                          id: user.id,
                          name: user.name,
                          username: user.username,
                          profile_picture: user.profile_picture,
                          bio: user.bio,
                          friends_since: new Date().toISOString(),
                        })
                      }
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand  text-white text-xs font-semibold  transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                  ) : hasReceivedRequest ? (
                    <button disabled className="flex-1 rounded-xl border border-card-border bg-surface-100 px-3 py-2 text-xs font-semibold text-slate-400">
                      Request Received · Check Requests
                    </button>
                  ) : isRequested ? (
                    <button
                      onClick={() => handleCancelRequest(user.id, user.name)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-rose-500/10  text-rose-300 border border-rose-500/30 transition-all shadow-sm"
                      title="Cancel sent friend request"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Cancel Request</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(user.id, user.name)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-surface-100  text-slate-200  border border-card-border  shadow-sm transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Friend</span>
                    </button>
                  )}

                  <button
                    onClick={() => setUserToBlock({ id: user.id, name: user.name })}
                    className="p-2 rounded-xl text-slate-500   transition-colors"
                    title="Block user"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {discoveryMode === "everyone" && hasMoreEveryone && (
        <div className="flex justify-center py-6">
          <button
            onClick={() => void fetchEveryone(everyonePage + 1, true)}
            disabled={isLoadingEveryone}
            className="rounded-xl border border-card-border bg-surface-100 px-5 py-2.5 text-xs font-semibold text-slate-200 disabled:opacity-50"
          >
            {isLoadingEveryone ? "Loading..." : "Load more people"}
          </button>
        </div>
      )}


      <BlockUserModal
        isOpen={!!userToBlock}
        onClose={() => setUserToBlock(null)}
        user={userToBlock}
        onConfirmBlock={async (userId) => {
          await onBlockUser(userId);
        }}
      />
    </div>
  );
};
