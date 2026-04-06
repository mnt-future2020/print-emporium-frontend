import { axiosInstance } from "./axios";

export interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeData {
  name: string;
  email: string;
}

export interface VerifyEmployeeData {
  token: string;
  password: string;
}

/**
 * Get all employees (admin only)
 */
export const getAllEmployees = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const response = await axiosInstance.get("/api/employees", { params });
  return response.data;
};

/**
 * Create a new employee (admin only)
 */
export const createEmployee = async (data: CreateEmployeeData) => {
  const response = await axiosInstance.post("/api/employees", data);
  return response.data;
};

/**
 * Verify employee account and set password
 */
export const verifyEmployee = async (data: VerifyEmployeeData) => {
  const response = await axiosInstance.post("/api/employees/verify", data);
  return response.data;
};

/**
 * Update employee status (admin only)
 */
export const updateEmployeeStatus = async (id: string, banned: boolean) => {
  const response = await axiosInstance.put(`/api/employees/${id}/status`, { banned });
  return response.data;
};

/**
 * Delete employee (admin only)
 */
export const deleteEmployee = async (id: string) => {
  const response = await axiosInstance.delete(`/api/employees/${id}`);
  return response.data;
};

/**
 * Resend verification email (admin only)
 */
export const resendVerification = async (id: string) => {
  const response = await axiosInstance.post(`/api/employees/${id}/resend-verification`);
  return response.data;
};
