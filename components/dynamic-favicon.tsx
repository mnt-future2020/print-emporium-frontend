"use client";

import { useEffect } from "react";
import { useCompanySettings } from "@/hooks/use-company-settings";

export function DynamicFavicon() {
  const { settings, loading } = useCompanySettings();

  useEffect(() => {
    if (loading || !settings?.favicon) return;

    const faviconUrl = settings.favicon;

    // Remove ALL existing favicon/icon links to prevent conflicts
    // (Next.js auto-generates one from app/favicon.ico)
    document
      .querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')
      .forEach((el) => el.remove());

    // Add the dynamic favicon with a cache-busting query param
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = faviconUrl.endsWith(".ico") ? "image/x-icon" : "image/png";
    link.href = `${faviconUrl}${faviconUrl.includes("?") ? "&" : "?"}v=${Date.now()}`;
    document.head.appendChild(link);
  }, [settings?.favicon, loading]);

  return null;
}
