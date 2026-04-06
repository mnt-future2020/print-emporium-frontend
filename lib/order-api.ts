import { axiosInstance } from "./axios";
import { DeliveryInfo } from "./order-types";

export interface OrderItemPayload {
  serviceId: string;
  serviceName: string;
  file: {
    name: string;
    size: number;
    pageCount: number;
    url?: string | null;
  };
  configuration: {
    printType: string;
    paperSize: string;
    paperType: string;
    gsm: string;
    printSide: string;
    bindingOption: string;
    copies: number;
  };
  pricing: {
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
    totalPages: number;
    copies: number;
    subtotal: number;
  };
}

export interface CreateOrderPayload {
  items: OrderItemPayload[];
  deliveryInfo: DeliveryInfo;
  pricing: {
    subtotal: number;
    deliveryCharge: number;
    packingCharge: number;
    discount?: number;
    total: number;
  };
  couponCode?: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  estimatedDelivery: string | null;
  createdAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: {
    serviceId: string;
    serviceName: string;
    fileName: string;
    fileSize: number;
    pageCount: number;
    fileUrl: string | null;
    configuration: {
      printType: string;
      paperSize: string;
      paperType: string;
      gsm: string;
      printSide: string;
      bindingOption: string;
      copies: number;
    };
    pricing: {
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
      totalPages: number;
      copies: number;
      subtotal: number;
    };
  }[];
  deliveryInfo: DeliveryInfo;
  pricing: {
    subtotal: number;
    deliveryCharge: number;
    packingCharge: number;
    total: number;
  };
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "printing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: "cod" | "online" | "upi";
  paymentId: string | null;
  trackingNumber: string | null;
  estimatedDelivery: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedOrders {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Create a new order
 */
export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<{ success: boolean; order: OrderResponse }> => {
  const response = await axiosInstance.post("/api/orders", payload);
  return response.data;
};

/**
 * Get current user's orders
 */
export const getUserOrders = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ success: boolean } & PaginatedOrders> => {
  const response = await axiosInstance.get("/api/orders/my-orders", { params });
  return response.data;
};

/**
 * Get a single order by ID
 */
export const getOrderById = async (
  id: string,
): Promise<{ success: boolean; order: Order }> => {
  const response = await axiosInstance.get(`/api/orders/${id}`);
  return response.data;
};

/**
 * Get a single order by ID (Admin/Employee - can view any order)
 */
export const getOrderByIdAdmin = async (
  id: string,
): Promise<{ success: boolean; order: Order }> => {
  const response = await axiosInstance.get(`/api/orders/admin/${id}`);
  return response.data;
};

/**
 * Cancel an order
 */
export const cancelOrder = async (
  id: string,
): Promise<{
  success: boolean;
  message: string;
  order: { id: string; orderNumber: string; status: string };
}> => {
  const response = await axiosInstance.post(`/api/orders/${id}/cancel`);
  return response.data;
};

/**
 * Update payment status (for payment callback)
 */
export const updatePaymentStatus = async (
  id: string,
  data: { paymentStatus: string; paymentId?: string; paymentMethod?: string },
): Promise<{
  success: boolean;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
  };
}> => {
  const response = await axiosInstance.post(`/api/orders/${id}/payment`, data);
  return response.data;
};

/**
 * Reorder a previously placed order
 */
export const reorderOrder = async (
  id: string,
): Promise<{ success: boolean; message: string; order: OrderResponse }> => {
  const response = await axiosInstance.post(`/api/orders/${id}/reorder`);
  return response.data;
};

// ============ ADMIN API ============

/**
 * Get all orders (admin)
 */
export const getAllOrders = async (params?: {
  status?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ success: boolean } & PaginatedOrders> => {
  const response = await axiosInstance.get("/api/orders/admin/all", { params });
  return response.data;
};

/**
 * Update order status (admin)
 */
export const updateOrderStatus = async (
  id: string,
  data: { status?: string; trackingNumber?: string; notes?: string },
): Promise<{
  success: boolean;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    trackingNumber: string;
  };
}> => {
  const response = await axiosInstance.put(
    `/api/orders/admin/${id}/status`,
    data,
  );
  return response.data;
};

/**
 * Get order statistics (admin)
 */
export const getOrderStats = async (): Promise<{
  success: boolean;
  stats: {
    totalOrders: number;
    todayOrders: number;
    monthOrders: number;
    pendingOrders: number;
    processingOrders: number;
    completedOrders: number;
    totalRevenue: number;
  };
}> => {
  const response = await axiosInstance.get("/api/orders/admin/stats");
  return response.data;
};
