import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axios";

export function useCompanyLogo() {
  const [logo, setLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await axiosInstance.get("/api/settings");
        if (response.data.success && response.data.data.companyLogo) {
          setLogo(response.data.data.companyLogo);
        }
      } catch (error) {
        console.error("Failed to fetch company logo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogo();
  }, []);

  return { logo, isLoading, setLogo };
}