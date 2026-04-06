import { axiosInstance } from "../lib/axios";

export interface HeroSlide {
  _id?: string;
  title: string;
  subtitle?: string;
  image: string | { data: string; name: string } | null;
  iconName?: string;
  features: string[];
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  isActive: boolean;
  order: number;
}

export const getAllHeroSlides = async (activeOnly = false) => {
  const response = await axiosInstance.get("/api/hero-slides", {
    params: { activeOnly },
  });
  return response.data;
};

export const upsertHeroSlide = async (data: Partial<HeroSlide> & { id?: string }) => {
  const response = await axiosInstance.put("/api/hero-slides", data);
  return response.data;
};

export const deleteHeroSlide = async (id: string) => {
  const response = await axiosInstance.delete(`/api/hero-slides/${id}`);
  return response.data;
};
