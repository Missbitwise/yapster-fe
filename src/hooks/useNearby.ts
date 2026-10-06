"use client";

import { useState, useCallback, useEffect } from "react";
import { NearbyUser } from "@/types/location.types";
import { locationService } from "@/services/location.service";
import { useAuth } from "@/context/AuthContext";

export const useNearby = (initialRadius: number = 10) => {
  const { isAuthenticated } = useAuth();
  const [radius, setRadius] = useState<number>(initialRadius);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLocation, setHasLocation] = useState<boolean>(false);
  const [currentLocality, setCurrentLocality] = useState<string>("");

  const fetchNearby = useCallback(
    async (searchRadius?: number) => {
      if (!isAuthenticated) return;
      const r = searchRadius ?? radius;
      setIsLoading(true);
      setError(null);
      try {
        const res = await locationService.getNearbyUsers(r);
        if (res.success && Array.isArray(res.data)) {
          setNearbyUsers(res.data);
          setHasLocation(true);
        }
      } catch (err: any) {
        console.warn("Nearby fetch:", err.response?.data?.message || err.message);
        // If error message indicates no location has been set yet, show friendly guidance
        setError(
          err.response?.data?.message ||
            "Please update your location to discover nearby friends."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, radius]
  );

  const updateLocation = async (
    lat: number,
    lng: number,
    localityName?: string
  ) => {
    setIsUpdatingLocation(true);
    setError(null);
    try {
      const res = await locationService.updateLocation({
        latitude: lat,
        longitude: lng,
        locality: localityName || undefined,
      });
      if (res.success) {
        setHasLocation(true);
        if (localityName) setCurrentLocality(localityName);
        await fetchNearby();
      }
      return res;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update location");
      throw err;
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const detectLocation = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsUpdatingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Attempt reverse geocode locality estimate
          let locality = "Current Location";
          try {
            const geocodeRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            if (geocodeRes.ok) {
              const geoData = await geocodeRes.json();
              locality =
                geoData.address?.city ||
                geoData.address?.town ||
                geoData.address?.suburb ||
                geoData.address?.state ||
                "Nearby";
            }
          } catch {
            locality = "My City";
          }

          await updateLocation(lat, lng, locality);
        } catch (err: any) {
          setError(err.message || "Failed to save location");
          setIsUpdatingLocation(false);
        }
      },
      (geoError) => {
        setIsUpdatingLocation(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError(
            "Location permission was denied. You can still set custom coordinates or enable permissions in browser."
          );
        } else {
          setError("Failed to get current GPS location: " + geoError.message);
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNearby();
    }
  }, [isAuthenticated, fetchNearby]);

  return {
    radius,
    setRadius,
    nearbyUsers,
    isLoading,
    isUpdatingLocation,
    error,
    hasLocation,
    currentLocality,
    fetchNearby,
    detectLocation,
    updateLocation,
  };
};
