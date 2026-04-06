// Order Types and Interfaces

import { Service } from "./service-api";

export interface UploadedFile {
  id: string;
  file: File;
  originalFile?: File; // Store the original non-converted file
  name: string;
  size: number;
  type: string;
  pageCount: number;
  previewUrl: string;
  uploadProgress: number;
  status: "uploading" | "processing" | "ready" | "error";
  error?: string;
}

export interface ServiceConfiguration {
  printType: string;
  paperSize: string;
  paperType: string;
  gsm: string;
  printSide: string;
  bindingOption: string;
  copies: number;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  serviceName: string;
  service: Service;
  file: UploadedFile;
  configuration: ServiceConfiguration;
  pricing: ItemPricing;
}

export interface ItemPricing {
  basePricePerPage: number;
  printTypePrice: number;
  paperSizePrice: number;
  paperTypePrice: number;
  gsmPrice: number;
  printSidePrice: number;
  bindingPrice: number;
  printTypeIsPerCopy: boolean;
  paperSizeIsPerCopy: boolean;
  paperTypeIsPerCopy: boolean;
  gsmIsPerCopy: boolean;
  printSideIsPerCopy: boolean;
  bindingIsPerCopy: boolean;
  pricePerPage: number;
  pricePerCopy: number;
  subtotal: number;
  totalPages: number;
  copies: number;
}

export interface DeliveryInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  deliveryNotes?: string;
  scheduleDelivery?: boolean;
  scheduledDate?: string;
}

export interface OrderSummary {
  items: OrderItem[];
  deliveryInfo: DeliveryInfo;
  subtotal: number;
  deliveryCharge: number;
  packingCharge: number;
  total: number;
}

export type OrderStep = "upload" | "configure" | "review";

export const DEFAULT_CONFIGURATION: ServiceConfiguration = {
  printType: "",
  paperSize: "",
  paperType: "",
  gsm: "",
  printSide: "",
  bindingOption: "",
  copies: 1,
};

export const DEFAULT_DELIVERY_INFO: DeliveryInfo = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  deliveryNotes: "",
  scheduleDelivery: false,
  scheduledDate: "",
};
