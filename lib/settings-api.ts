import { axiosInstance } from "../lib/axios";

export interface GeneralSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  whatsappNumber?: string;
  companyAddress: string;
  companyDescription: string;
  companyLogo?: string | null;
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

// Get all settings (Admin)
export const getSettings = async () => {
  const response = await axiosInstance.get("/api/settings");
  return response.data;
};


// Update general settings
export const updateGeneralSettings = async (data: GeneralSettings) => {
  const response = await axiosInstance.put("/api/settings/general", data);
  return response.data;
};
