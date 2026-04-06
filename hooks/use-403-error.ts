"use client";

import { useState, useEffect, useCallback } from "react";

export interface AccessDeniedError {
  type: "access-denied";
  title: string;
  message: string;
  suggestions: string[];
  status: 403;
  timestamp: string;
}

export function use403Error() {
  const [error, setError] = useState<AccessDeniedError | null>(null);

  useEffect(() => {
    const handleAccessDenied = (event: Event) => {
      if (event instanceof CustomEvent) {
        setError(event.detail as AccessDeniedError);
      }
    };

    window.addEventListener("api-error-403", handleAccessDenied);

    return () => {
      window.removeEventListener("api-error-403", handleAccessDenied);
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, clearError };
}
