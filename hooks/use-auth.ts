"use client";

import { useState, useEffect, useCallback } from "react";
import { getSession, logout, login, signup, type User } from "@/lib/auth-api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const checkSession = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await getSession();
      
      if (response.success && response.data?.user) {
        setAuthState({
          user: response.data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("Session check failed:", error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : "Session check failed",
      });
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await login(email, password);
      
      if (response.success && response.data?.user) {
        setAuthState({
          user: response.data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        return { success: true };
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await signup(email, password, name);
      
      if (response.success && response.data?.user) {
        setAuthState({
          user: response.data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        return { success: true };
      } else {
        throw new Error("Signup failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Signup failed";
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logout();
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
      
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails on server, clear local state
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: "Logout failed",
      });
    }
  }, []);

  const refreshSession = useCallback(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };
}