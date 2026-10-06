"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, LoginDTO, RegisterDTO } from "@/types/user.types";
import { authService } from "@/services/auth.service";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginDTO) => Promise<User>;
  register: (data: RegisterDTO) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserLocally: (updater: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("yapster_token");
      localStorage.removeItem("yapster_user");
    }
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const initAuth = useCallback(async () => {
    try {
      if (typeof window === "undefined") return;
      const storedToken = localStorage.getItem("yapster_token");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem("yapster_user", JSON.stringify(res.data));
      } else {
        logout();
      }
    } catch (error) {
      console.warn("Session restore failed, logging out:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    initAuth();

    const handleAuthChange = () => {
      initAuth();
    };

    window.addEventListener("yapster_auth_change", handleAuthChange);
    return () => {
      window.removeEventListener("yapster_auth_change", handleAuthChange);
    };
  }, [initAuth]);

  const login = async (credentials: LoginDTO): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      if (res.success && res.data) {
        const { user: loggedInUser, token: receivedToken } = res.data;
        setToken(receivedToken);
        setUser(loggedInUser);
        localStorage.setItem("yapster_token", receivedToken);
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
        // Automatically login after successful registration
        return await login({ email: data.email, password: data.password });
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
    setUser((prev) => (prev ? { ...prev, ...updater } : null));
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
        updateUserLocally,
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
