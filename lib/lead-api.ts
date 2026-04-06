import { axiosInstance } from "./axios";

export interface CreateLeadData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  source?: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "contacted" | "qualified" | "lost" | "converted";
  source: string;
  notes: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Submit contact form lead
 */
export const createLead = async (data: CreateLeadData) => {
  const response = await axiosInstance.post("/api/leads", data);
  return response.data;
};

/**
 * Get all leads (admin/employee)
 */
export const getLeads = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const response = await axiosInstance.get("/api/leads/all", { params });
  return response.data;
};

/**
 * Update lead (admin/employee)
 */
export const updateLead = async (id: string, data: Partial<Lead>) => {
  const response = await axiosInstance.patch(`/api/leads/${id}`, data);
  return response.data;
};

/**
 * Delete lead (admin/employee)
 */
export const deleteLead = async (id: string) => {
  const response = await axiosInstance.delete(`/api/leads/${id}`);
  return response.data;
};
