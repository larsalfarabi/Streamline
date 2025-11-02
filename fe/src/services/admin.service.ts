import { axiosInstance } from "@/src/lib/axios";
import type {
  AdminSchedule,
  AdminScheduleDetail,
  ScheduleFormData,
  User,
  Product,
  Voucher,
} from "@/lib/types";

// ======================================
// SCHEDULE CRUD
// ======================================

/**
 * Get all schedules (admin view)
 */
export const getAllSchedules = async (params?: {
  date?: string;
  hostId?: number;
  platform?: string;
}): Promise<AdminSchedule[]> => {
  const response = await axiosInstance.get("/api/admin/schedules", { params });
  return response.data.data;
};

/**
 * Get schedule by ID (for edit form)
 */
export const getScheduleById = async (
  id: string
): Promise<AdminScheduleDetail> => {
  const response = await axiosInstance.get(`/api/admin/schedules/${id}`);
  return response.data.data;
};

/**
 * Create new schedule
 */
export const createSchedule = async (data: ScheduleFormData) => {
  const response = await axiosInstance.post("/api/admin/schedules", data);
  return response.data;
};

/**
 * Update schedule
 */
export const updateSchedule = async (id: string, data: ScheduleFormData) => {
  const response = await axiosInstance.put(`/api/admin/schedules/${id}`, data);
  return response.data;
};

/**
 * Delete schedule
 */
export const deleteSchedule = async (id: string) => {
  const response = await axiosInstance.delete(`/api/admin/schedules/${id}`);
  return response.data;
};

// ======================================
// MASTER DATA
// ======================================

/**
 * Get all hosts (for dropdown)
 */
export const getHosts = async (): Promise<User[]> => {
  const response = await axiosInstance.get("/api/admin/users/hosts");
  return response.data.data;
};

/**
 * Get all products (with optional search)
 */
export const getProducts = async (search?: string): Promise<Product[]> => {
  const response = await axiosInstance.get("/api/admin/products", {
    params: { search },
  });
  return response.data.data;
};

/**
 * Get all active vouchers
 */
export const getVouchers = async (): Promise<Voucher[]> => {
  const response = await axiosInstance.get("/api/admin/vouchers");
  return response.data.data;
};
