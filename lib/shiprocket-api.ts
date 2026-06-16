import { axiosInstance } from "./axios";

export interface ShiprocketCourier {
  courier_company_id: number;
  courier_name: string;
  courier_type?: string;
  rate: number;
  freight_charge?: number;
  cod_charges?: number;
  coverage_charges?: number;
  other_charges?: number;
  etd?: string;
  estimated_delivery_days?: string;
  charge_weight?: number;
  min_weight?: number;
  rto_charges?: number;
  rating?: number;
  pickup_availability?: string;
  is_recommended?: boolean;
  suppress_date?: string;
  expected_pickup_date?: string;
  total_charges?: number;
  // Allow any extra fields the API returns
  [key: string]: unknown;
}

export interface ServiceabilityResult {
  success: boolean;
  serviceable: boolean;
  cheapestRate: number | null;
  cheapestCourier: string | null;
  etd: string | null;
  couriers: ShiprocketCourier[];
}

export interface ShiprocketMeta {
  orderId?: string | null;
  shipmentId?: string | null;
  awbCode?: string | null;
  courierId?: number | null;
  courierName?: string | null;
  labelUrl?: string | null;
  manifestUrl?: string | null;
  lastStatus?: string | null;
  lastStatusAt?: string | null;
  lastSyncedAt?: string | null;
}

export interface TrackingActivity {
  date?: string;
  activity?: string;
  location?: string;
  status?: string;
  sr_status_label?: string;
}

export interface TrackingResponse {
  success: boolean;
  tracking: {
    track_status?: number | string;
    shipment_status?: number | string;
    shipment_track?: Array<{
      awb_code?: string;
      courier_name?: string;
      current_status?: string;
      origin?: string;
      destination?: string;
      pickup_date?: string;
      delivered_date?: string;
    }>;
    shipment_track_activities?: TrackingActivity[];
    etd?: string;
    track_url?: string;
  };
}

export interface OrderCouriersResult {
  success: boolean;
  context: {
    deliveryPincode: string;
    weightKg: number;
    orderValue: number;
  };
  recommendedId?: number | null;
  couriers: ShiprocketCourier[];
}

export const getOrderCouriers = async (
  orderId: string,
): Promise<OrderCouriersResult> => {
  const res = await axiosInstance.get(
    `/api/shipping/orders/${orderId}/couriers`,
  );
  return res.data;
};

export const checkServiceability = async (params: {
  pickup: string;
  delivery: string;
  weight?: number;
  cod?: number;
}): Promise<ServiceabilityResult> => {
  const res = await axiosInstance.get("/api/shipping/serviceability", {
    params: {
      pickup: params.pickup,
      delivery: params.delivery,
      weight: params.weight ?? 0.5,
      cod: params.cod ?? 0,
    },
  });
  return res.data;
};

export const pushOrderToShiprocket = async (orderId: string) => {
  const res = await axiosInstance.post(`/api/shipping/orders/${orderId}/push`);
  return res.data as { success: boolean; shiprocket: ShiprocketMeta; raw?: unknown };
};

export const assignOrderAwb = async (orderId: string, courierId?: number) => {
  const res = await axiosInstance.post(
    `/api/shipping/orders/${orderId}/awb`,
    courierId ? { courierId } : {},
  );
  return res.data as { success: boolean; shiprocket: ShiprocketMeta; raw?: unknown };
};

export const schedulePickup = async (orderId: string) => {
  const res = await axiosInstance.post(
    `/api/shipping/orders/${orderId}/pickup`,
  );
  return res.data as { success: boolean; raw?: unknown };
};

export const trackOrder = async (orderId: string): Promise<TrackingResponse> => {
  const res = await axiosInstance.get(`/api/shipping/orders/${orderId}/track`);
  return res.data;
};

export const fetchLabel = async (orderId: string) => {
  const res = await axiosInstance.get(`/api/shipping/orders/${orderId}/label`);
  return res.data as { success: boolean; labelUrl?: string | null; raw?: unknown };
};

export interface ShippingOption {
  rate: number;
  courierName: string | null;
  etd: string | null;
  estimatedDays: string | null;
  courierId: number;
}

export interface CheckoutRateResult {
  success: boolean;
  serviceable: boolean;
  fallback: boolean;
  recommended: ShippingOption | null;
  fastest: ShippingOption | null;
}

export const getCheckoutRate = async (params: {
  deliveryPincode: string;
  items: Array<{ serviceId: string; pageCount: number; copies: number }>;
}): Promise<CheckoutRateResult> => {
  const res = await axiosInstance.post("/api/shipping/checkout-rate", params);
  return res.data;
};
