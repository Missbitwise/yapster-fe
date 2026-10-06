"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Navigation, MapPin, Loader2, ShieldCheck, X } from "lucide-react";

interface LocationPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSuccess: (lat: number, lng: number, locality: string) => Promise<any>;
}

export const LocationPromptModal: React.FC<LocationPromptModalProps> = ({
  isOpen,
  onClose,
  onLocationSuccess,
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [manualCity, setManualCity] = useState("");

  const handleRequestLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Attempt reverse geocoding to obtain the user's city or locality
          let locality = "Nearby";
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
                "My Location";
            }
          } catch {
            locality = "Current City";
          }

          await onLocationSuccess(lat, lng, locality);
          setIsDetecting(false);
          onClose();
        } catch (err: any) {
          setError(err.message || "Failed to save your location");
          setIsDetecting(false);
        }
      },
      (geoError) => {
        setIsDetecting(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError(
            "Location permission was denied. You can enter your coordinates manually below."
          );
          setShowManual(true);
        } else {
          setError("GPS error: " + geoError.message);
        }
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng)) {
      setError("Please provide valid latitude and longitude numbers");
      return;
    }

    try {
      setIsDetecting(true);
      setError(null);
      await onLocationSuccess(lat, lng, manualCity || "Custom Location");
      setIsDetecting(false);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update location");
      setIsDetecting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Find Friends in Your Area"
      maxWidth="md"
    >
      <div className="space-y-4 text-center">
        {/* Radar Icon with glowing halo */}
        <div className="mx-auto w-16 h-16 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center text-brand-light shadow-glow">
          <Navigation className="w-8 h-8 animate-pulse text-brand" />
        </div>

        <div>
          <h4 className="text-base font-bold text-white">
            Connect with People Near You
          </h4>
          <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
            Yapster uses your general area to show friends and people hanging out
            close by (within 1 to 50 km).
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-left">
            {error}
          </div>
        )}

        {!showManual ? (
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleRequestLocation}
              disabled={isDetecting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-glow transition-all disabled:opacity-50"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Finding your location...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  <span>Allow Location Access</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowManual(true)}
              className="text-xs text-slate-400 hover:text-brand-light underline py-1 block mx-auto"
            >
              Or enter your city manually
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-3 pt-2 text-left">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                required
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                placeholder="e.g. 19.0760"
                className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-card-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                required
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                placeholder="e.g. 72.8777"
                className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-card-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Locality / City Name
              </label>
              <input
                type="text"
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-card-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowManual(false)}
                className="flex-1 py-2 rounded-xl bg-surface-100 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isDetecting}
                className="flex-1 py-2 rounded-xl bg-brand text-xs font-semibold text-white hover:bg-brand-dark shadow-glow-sm"
              >
                {isDetecting ? "Saving..." : "Save Location"}
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Your exact street address is never shown—only approximate distance</span>
        </div>
      </div>
    </Modal>
  );
};
