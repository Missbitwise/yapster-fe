"use client";

import { useState, useCallback, useEffect } from "react";
import { locationService } from "@/services/location.service";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { DiscoveredUser, NearbyUser } from "@/types/location.types";

export const useNearby = (initialRadius: number = 10) => {
  const { isAuthenticated } = useAuth();
  const {
    savedLocation,
    hasLocation,
    isLoadingLocation,
    isUpdatingLocation,
    locationError,
    updateLocation,
    detectLocation,
    refreshLocation,
  } = useLocation();
  const [radius, setRadius] = useState<number>(initialRadius);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [everyoneUsers, setEveryoneUsers] = useState<DiscoveredUser[]>([]);
  const [everyonePage, setEveryonePage] = useState(0);
  const [hasMoreEveryone, setHasMoreEveryone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEveryone, setIsLoadingEveryone] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);

  const fetchNearby = useCallback(
    async (searchRadius?: number) => {
      if (!isAuthenticated || isLoadingLocation) return;
      if (!hasLocation) {
        setNearbyUsers([]);
        return;
      }

      setIsLoading(true);
      setDiscoveryError(null);
      try {
        const response = await locationService.getNearbyUsers(searchRadius ?? radius);
        if (response.success && Array.isArray(response.data)) {
          setNearbyUsers(response.data);
        }
      } catch (error: any) {
        setDiscoveryError(
          error.response?.data?.message || "Could not load nearby users. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [hasLocation, isAuthenticated, isLoadingLocation, radius]
  );

  const fetchEveryone = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (!isAuthenticated) return;
      setIsLoadingEveryone(true);
      setDiscoveryError(null);
      try {
        const response = await locationService.getEveryone(page);
        if (response.success && response.data) {
          setEveryoneUsers((previous) =>
            append
              ? [
                  ...previous,
                  ...response.data.users.filter(
                    (user) => !previous.some((existing) => existing.id === user.id)
                  ),
                ]
              : response.data.users
          );
          setEveryonePage(response.data.page);
          setHasMoreEveryone(response.data.hasMore);
        }
      } catch (error: any) {
        setDiscoveryError(
          error.response?.data?.message || "Could not load users. Please try again."
        );
      } finally {
        setIsLoadingEveryone(false);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    if (isAuthenticated && hasLocation && !isLoadingLocation) {
      void fetchNearby();
    }
  }, [isAuthenticated, hasLocation, isLoadingLocation, fetchNearby]);

  return {
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
    error: discoveryError,
    locationError,
    hasLocation,
    currentLocality: savedLocation?.locality || "",
    fetchNearby,
    fetchEveryone,
    detectLocation,
    refreshLocation,
    updateLocation,
  };
};
