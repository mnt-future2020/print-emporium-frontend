import { axiosInstance } from "../lib/axios";

// --- Service Options (Dynamic Attributes) ---

export interface ServiceOption {
  _id?: string;
  category:
    | "printType"
    | "paperSize"
    | "paperType"
    | "gsm"
    | "printSide"
    | "bindingOption";
  label: string;
  value: string;
  isActive: boolean;
  pricePerPage?: number;
  pricePerCopy?: number;
  minPages?: number;
  fixedPrice?: number;
  priceRanges?: { min: number; max: number; price: number }[];
}

export interface OptionPricing {
  value: string;
  label?: string;
  pricePerPage: number;
  pricePerCopy: number;
  minPages?: number;
  fixedPrice?: number;
  priceRanges?: { min: number; max: number; price: number }[];
}

export const getAllServiceOptions = async (
  category?: string,
  activeOnly = false,
) => {
  const response = await axiosInstance.get("/api/service-options", {
    params: { category, activeOnly },
  });
  return response.data;
};

export const upsertServiceOption = async (
  data: ServiceOption | ({ id: string } & Partial<ServiceOption>),
) => {
  const response = await axiosInstance.put("/api/service-options", data);
  return response.data;
};

export const deleteServiceOption = async (id: string) => {
  const response = await axiosInstance.delete(`/api/service-options/${id}`);
  return response.data;
};

// --- Services ---

export interface Service {
  _id?: string;
  name: string;
  description?: string;
  image?: string | { data: string; name: string } | null;
  basePrice?: number; // Alias for basePricePerPage for display purposes
  basePricePerPage: number;
  basePriceRanges?: { min: number; max: number; price: number }[];
  customQuotation?: boolean;
  printTypes: OptionPricing[];
  paperSizes: OptionPricing[];
  paperTypes: OptionPricing[];
  gsmOptions: OptionPricing[];
  printSides: OptionPricing[];
  bindingOptions: OptionPricing[];
  status: "active" | "inactive";
}

export const getAllServices = async (status?: string) => {
  const response = await axiosInstance.get("/api/services", {
    params: { status },
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
  return response.data;
};

export const getServiceById = async (id: string) => {
  const response = await axiosInstance.get(`/api/services/${id}`, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
  return response.data;
};

export const upsertService = async (
  data: Service | ({ id: string } & Partial<Service>),
) => {
  const response = await axiosInstance.put("/api/services", data);
  return response.data;
};

export const deleteService = async (id: string) => {
  const response = await axiosInstance.delete(`/api/services/${id}`);
  return response.data;
};
