"use client";

import { useState, useEffect } from "react";
import { getSettings } from "@/lib/settings-api";

interface CompanySettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  whatsappNumber?: string;
  companyAddress: string;
  companyDescription: string;
  companyLogo: string | null;
  favicon?: string | null;
  workingHours?: string;
  latitude?: string;
  longitude?: string;
  googleMapEmbed?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  gstNumber?: string;
  termsAndConditions?: string;
  footerNote?: string;
}

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await getSettings();
        if (response.success) {
          setSettings(response.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch company settings:", err);
        setError(err.message || "Failed to fetch settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
}
