"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand to-purple-400 p-0.5 shadow-glow mb-4 animate-bounce">
          <div className="w-full h-full bg-surface-300 rounded-[14px] flex items-center justify-center">
            <span className="font-extrabold text-xl text-white">Y</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-brand-light font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Connecting to Yapster...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
