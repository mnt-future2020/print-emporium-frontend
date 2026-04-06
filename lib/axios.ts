import axios from "axios";
import { getSignatureHeaders } from "./signature-utils";

// Dynamic API URL based on environment
const getApiUrl = () => {
  // Use environment variable if defined
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Browser fallback
  if (typeof window !== "undefined") {
    // If we're on localhost:3000, assume backend is on localhost:5000
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "http://localhost:5000";
    }
    // Fallback to same domain /api
    return `${window.location.origin}/api`;
  }

  // Server-side fallback (SSR)
  return process.env.NEXT_PUBLIC_API_URL;
};

export const axiosInstance = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatic Signature Injection for Server-Side Fetching
// This will only run on the server to keep your secret safe!
axiosInstance.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    // Use the universal API_SHARED_SECRET
    const secret =
      process.env.API_SHARED_SECRET || "default_api_secret_change_me";

    if (secret && config.url && config.method) {
      const sigHeaders = getSignatureHeaders(config.method, config.url, secret);
      config.headers["x-signature"] = sigHeaders["x-signature"];
      config.headers["x-timestamp"] = sigHeaders["x-timestamp"];
    } else if (!secret) {
      console.warn(
        "⚠️ API_SHARED_SECRET is not defined. Server-side signatures will fail."
      );
    }
  }
  return config;
});

// Add response interceptor to handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 and we're on the client side, redirect to login
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // Handle 403 Forbidden errors with user-friendly message
    if (error.response?.status === 403 && typeof window !== "undefined") {
      const errorMessage = {
        type: "access-denied" as const,
        title: "Access Denied",
        message: "You don't have permission to access this resource.",
        suggestions: [
          "Contact our support team for assistance",
          "Try logging in with a different account",
          "Refresh the page and try again",
        ],
        status: 403,
        timestamp: new Date().toISOString(),
      };

      // Dispatch custom event that components can listen to
      window.dispatchEvent(
        new CustomEvent("api-error-403", { detail: errorMessage })
      );

      // Log for debugging
      console.warn("🔒 Access Denied (403):", error.response?.data);
    }

    return Promise.reject(error);
  }
);
