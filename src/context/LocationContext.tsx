"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { locationService } from "@/services/location.service";
import { UpdateLocationDTO, UserLocation } from "@/types/location.types";

interface LocationContextValue {
  savedLocation: UserLocation | null;
  hasLocation: boolean;
  isLoadingLocation: boolean;
  isUpdatingLocation: boolean;
  locationError: string | null;
  updateLocation: (latitude: number, longitude: number, locality?: string) => Promise<void>;
  detectLocation: () => Promise<void>;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

const getLocalityFromAddress = (address: Record<string, string> | undefined) => {
  if (!address) return "";
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    "";
  const region = address.state || address.region || "";
  return [city, region].filter((part, index, parts) => part && parts.indexOf(part) === index).join(", ");
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [savedLocation, setSavedLocation] = useState<UserLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const refreshLocation = useCallback(async () => {
    if (!isAuthenticated) {
      setSavedLocation(null);
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);
    try {
      const response = await locationService.getMyLocation();
      setSavedLocation(response.success ? response.data : null);
    } catch (error: any) {
      setLocationError(
        error.response?.data?.message || "Could not load your saved location."
      );
    } finally {
      setIsLoadingLocation(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      setSavedLocation(null);
      setLocationError(null);
      setIsLoadingLocation(false);
      return;
    }
    void refreshLocation();
  }, [isAuthenticated, isAuthLoading, user?.id, refreshLocation]);

  const updateLocation = useCallback(
    async (latitude: number, longitude: number, locality?: string) => {
      setIsUpdatingLocation(true);
      setLocationError(null);
      try {
        const payload: UpdateLocationDTO = {
          latitude,
          longitude,
          locality: locality?.trim() || undefined,
        };
        const response = await locationService.updateLocation(payload);
        if (!response.success || !response.data) {
          throw new Error(response.message || "Failed to save your location.");
        }
        setSavedLocation(response.data);
      } catch (error: any) {
        const message =
          error.response?.data?.message || error.message || "Failed to save your location.";
        setLocationError(message);
        throw new Error(message);
      } finally {
        setIsUpdatingLocation(false);
      }
    },
    []
  );

  const detectLocation = useCallback(async () => {
    setIsUpdatingLocation(true);
    setLocationError(null);
    try {
      if (typeof window === "undefined" || !navigator.geolocation) {
        throw new Error("Location is not supported by this browser.");
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 12000,
          enableHighAccuracy: false,
          maximumAge: 5 * 60 * 1000,
        });
      });
      let locality = "";
      try {
        const params = new URLSearchParams({
          lat: String(position.coords.latitude),
          lon: String(position.coords.longitude),
          format: "json",
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
        if (response.ok) {
          const data = await response.json();
          locality = getLocalityFromAddress(data.address);
        }
      } catch {
        locality = "";
      }

      await updateLocation(position.coords.latitude, position.coords.longitude, locality);
    } catch (error: any) {
      const geoError = typeof error?.code === "number";
      const message = geoError
        ? error.code === 1
          ? "Location permission was denied. Allow location access in your browser settings and try again."
          : error.code === 2
            ? "Your current location is unavailable. Try again or enter a city manually."
            : "Getting your location timed out. Try again."
        : error.message || "Failed to get your location.";
      setLocationError(message);
      throw new Error(message);
    } finally {
      setIsUpdatingLocation(false);
    }
  }, [updateLocation]);

  const value = useMemo(
    () => ({
      savedLocation,
      hasLocation: Boolean(savedLocation),
      isLoadingLocation,
      isUpdatingLocation,
      locationError,
      updateLocation,
      detectLocation,
      refreshLocation,
    }),
    [
      savedLocation,
      isLoadingLocation,
      isUpdatingLocation,
      locationError,
      updateLocation,
      detectLocation,
      refreshLocation,
    ]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocation must be used within a LocationProvider");
  return context;
};
