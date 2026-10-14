"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { User, LoginDTO, RegisterDTO } from "@/types/user.types";
import { authService } from "@/services/auth.service";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginDTO) => Promise<User>;
  register: (data: RegisterDTO) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserLocally: (updater: Partial<User>) => void;
  updateProfile: (data: {
    name: string;
    username: string;
    bio: string;
    profile_picture?: string | null;
  }) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("yapster_token");
      localStorage.removeItem("yapster_user");
    }
    setUser(null);
    authService.logout().catch(() => undefined);
    router.push("/login");
  }, [router]);

  const initAuth = useCallback(async () => {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem("yapster_token");
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem("yapster_user", JSON.stringify(res.data));
      } else {
        setUser(null);
        localStorage.removeItem("yapster_user");
      }
    } catch (error) {
      setUser(null);
      if (typeof window !== "undefined") localStorage.removeItem("yapster_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      localStorage.removeItem("yapster_user");
    };
    window.addEventListener("yapster_auth_expired", handleAuthExpired);
    return () => window.removeEventListener("yapster_auth_expired", handleAuthExpired);
  }, []);

  const login = async (credentials: LoginDTO): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      if (res.success && res.data) {
        const { user: loggedInUser } = res.data;
        setUser(loggedInUser);
        localStorage.setItem("yapster_user", JSON.stringify(loggedInUser));
        return loggedInUser;
      }
      throw new Error(res.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterDTO): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem("yapster_user", JSON.stringify(res.data));
        return res.data;
      }
      throw new Error(res.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem("yapster_user", JSON.stringify(res.data));
      }
    } catch (e) {
      console.error("Failed to refresh user profile", e);
    }
  };

  const updateUserLocally = (updater: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updater };
      if (typeof window !== "undefined") {
        localStorage.setItem("yapster_user", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const updateProfile = async (data: {
    name: string;
    username: string;
    bio: string;
    profile_picture?: string | null;
  }): Promise<User> => {
    const res = await authService.updateProfile({
      ...data,
      username: data.username.trim().toLowerCase(),
    });
    if (!res.success || !res.data) {
      throw new Error(res.message || "Failed to update profile");
    }
    setUser(res.data);
    localStorage.setItem("yapster_user", JSON.stringify(res.data));
    return res.data;
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
        updateUserLocally,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
