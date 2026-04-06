import { axiosInstance } from "../lib/axios";

export interface SEOSettings {
  _id?: string;
  pageName: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogImage?: string | { data: string; name: string } | null;
}

// Get all SEO settings (Admin)
export const getAllSEOSettings = async () => {
  const response = await axiosInstance.get("/api/seo");
  return response.data;
};

// Get SEO settings for a specific page (Admin)
export const getSEOSettingsByPage = async (pageName: string) => {
  try {
    const response = await axiosInstance.get(`/api/seo/${pageName}`);
    return response.data;
  } catch (error: any) {
    // Handle 404 gracefully - return empty success response
    if (error.response?.status === 404) {
      return { success: true, data: null };
    }
    throw error;
  }
};

// Create or update SEO settings
export const upsertSEOSettings = async (data: SEOSettings) => {
  const response = await axiosInstance.put("/api/seo", data);
  return response.data;
};

// Delete SEO settings
export const deleteSEOSettings = async (pageName: string) => {
  const response = await axiosInstance.delete(`/api/seo/${pageName}`);
  return response.data;
};
