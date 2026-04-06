import { axiosInstance } from "./axios";
import { Order } from "./order-api";

export interface Customer {
  id: string;
  name: string;
  email: string;
  image?: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
  role: string;
  createdAt: string;
}

export const getAllCustomers = async (params?: { search?: string; page?: number; limit?: number }) => {
  const response = await axiosInstance.get("/api/customers", { params });
  return response.data;
};

export const getCustomerDetails = async (id: string): Promise<{ success: boolean; customer: any; orders: Order[] }> => {
  const response = await axiosInstance.get(`/api/customers/${id}`);
  return response.data;
};
