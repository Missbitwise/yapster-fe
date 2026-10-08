"use client";

import React, { useState } from "react";
import { useNearby } from "@/hooks/useNearby";
import { Avatar } from "@/components/ui/Avatar";
import { Friend, FriendRequest } from "@/types/friend.types";
import { useToast } from "@/context/ToastContext";
import {
  Compass,
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
}

export const NearbyRadar: React.FC<NearbyRadarProps> = ({
  friends,
  sentRequests = [],
  onOpenChat,
  onSendFriendRequest,
  onCancelFriendRequest,
  onBlockUser,
}) => {
  const {
    radius,
    setRadius,
    nearbyUsers,
    isLoading,
    isUpdatingLocation,
    error,
    currentLocality,
    detectLocation,
    updateLocation,
    fetchNearby,
  } = useNearby(10);

  const { showToast } = useToast();
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [showManualForm, setShowManualForm] = useState(false);
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
    await updateLocation(lat, lng, manualCity || "Custom Location");
    setShowManualForm(false);
  };

  return (
    <div className="flex flex-col h-full bg-surface-300 p-4 sm:p-6 overflow-y-auto">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-card via-surface-100 to-card border border-card-border p-6 shadow-xl mb-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-light text-xs font-semibold uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4 animate-spin-slow text-brand" />
              <span>People In Your Area</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Discover Friends Nearby
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md">
              Find friendly people around your neighborhood or city. Connect and start chatting!
            </p>
            {currentLocality && (
              <div className="flex items-center gap-1.5 mt-2.5 text-xs text-emerald-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>Your Current Area: {currentLocality}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={detectLocation}
              disabled={isUpdatingLocation}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-glow transition-all disabled:opacity-50"
            >
              {isUpdatingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              <span>{isUpdatingLocation ? "Finding Your Area..." : "Update My Location"}</span>
            </button>

            <button
              onClick={() => setShowManualForm(!showManualForm)}
              className="px-3.5 py-2.5 rounded-2xl bg-surface-100 border border-card-border hover:border-brand/60 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              Set City Manually
            </button>
          </div>
        </div>
      </div>

      {/* Manual Coordinates Form if toggled */}
      {showManualForm && (
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
            className="px-4 py-2 bg-brand text-white rounded-xl text-xs font-semibold hover:bg-brand-dark transition-colors"
          >
            Save Location
          </button>
        </form>
      )}

      {/* Radius Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-200/80 border border-card-border rounded-2xl px-4 py-3 mb-6">
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
            className="px-3 py-1 bg-surface-100 hover:bg-surface-50 border border-card-border rounded-xl text-xs text-slate-300 hover:text-white transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error / Alert notice */}
      {error && (
        <div className="bg-amber-950/40 border border-amber-700/50 rounded-2xl p-4 text-xs text-amber-200 mb-6 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={detectLocation}
            className="underline hover:text-white font-semibold ml-2"
          >
            Enable Location
          </button>
        </div>
      )}

      {/* Nearby Users Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand mb-2" />
          <p className="text-xs">Scanning for people nearby within {radius} km...</p>
        </div>
      ) : nearbyUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 bg-surface-200/40 border border-card-border/60 rounded-3xl p-8">
          <Compass className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">
            No users detected within {radius} km
          </h3>
          <p className="text-xs max-w-sm mb-4">
            Try expanding the search radius slider or invite friends in your area to
            register and share their location!
          </p>
          <button
            onClick={() => {
              setRadius(50);
              fetchNearby(50);
            }}
            className="px-4 py-2 rounded-xl bg-surface-100 border border-card-border text-xs text-brand-light hover:text-white hover:border-brand transition-colors"
          >
            Expand to 50 km
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nearbyUsers.map((user) => {
            const isAlreadyFriend = friendIdSet.has(user.id);
            const isRequested = requestedUserIds.has(user.id) || sentRequestMap.has(user.id);

            return (
              <div
                key={user.id}
                className="bg-card border border-card-border hover:border-brand/50 rounded-3xl p-5 shadow-lg flex flex-col justify-between transition-all group hover:shadow-glow-sm"
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
                      {user.distance_km} km
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-brand-light transition-colors truncate">
                    {user.name}
                  </h3>
                  <p className="text-xs text-slate-400 mb-2 truncate">
                    @{user.username}
                  </p>

                  {user.locality && (
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
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-glow-sm transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                  ) : isRequested ? (
                    <button
                      onClick={() => handleCancelRequest(user.id, user.name)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all shadow-sm"
                      title="Cancel sent friend request"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Cancel Request</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(user.id, user.name)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-surface-100 hover:bg-brand text-slate-200 hover:text-white border border-card-border hover:border-brand shadow-sm transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Friend</span>
                    </button>
                  )}

                  <button
                    onClick={() => setUserToBlock({ id: user.id, name: user.name })}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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

      {/* Block Confirmation Modal */}
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
