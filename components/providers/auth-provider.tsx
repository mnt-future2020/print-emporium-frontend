"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession, logout as apiLogout, User } from "@/lib/auth-api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch current user session
  const fetchUser = useCallback(async () => {
    try {
      const response = await getSession();

      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        console.log("❌ No valid session found");
        setUser(null);
      }
    } catch (error) {
      console.error("❌ Session fetch failed:", error);
      // Session doesn't exist or expired
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function (set user after successful login)
  const login = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await apiLogout();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
