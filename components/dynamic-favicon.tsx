"use client";

import { useEffect } from "react";
import { useCompanySettings } from "@/hooks/use-company-settings";

export function DynamicFavicon() {
  const { settings, loading } = useCompanySettings();

  useEffect(() => {
    if (!loading && settings?.favicon) {
      // Update favicon
      const link = document.querySelector(
        "link[rel~='icon']"
      ) as HTMLLinkElement;
      if (link) {
        link.href = settings.favicon;
      } else {
        // Create new favicon link if it doesn't exist
        const newLink = document.createElement("link");
        newLink.rel = "icon";
        newLink.href = settings.favicon;
        document.head.appendChild(newLink);
      }
    }
  }, [settings?.favicon, loading]);

  return null; // This component doesn't render anything
}
