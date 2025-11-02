import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getHosts,
  getProducts,
  getVouchers,
} from "@/src/services/admin.service";
import type { ScheduleFormData } from "@/lib/types";

/**
 * Hook to get all schedules (admin view)
 */
export const useAdminSchedules = (params?: {
  date?: string;
  hostId?: number;
  platform?: string;
}) => {
  return useQuery({
    queryKey: ["adminSchedules", params],
    queryFn: () => getAllSchedules(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to get schedule detail by ID
 */
export const useAdminScheduleDetail = (id: string | null) => {
  return useQuery({
    queryKey: ["adminScheduleDetail", id],
    queryFn: () => getScheduleById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to create new schedule
 */
export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ScheduleFormData) => createSchedule(data),
    onSuccess: () => {
      // Invalidate schedules to refetch
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
    },
  });
};

/**
 * Hook to update schedule
 */
export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ScheduleFormData }) =>
      updateSchedule(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both list and detail
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
      queryClient.invalidateQueries({
        queryKey: ["adminScheduleDetail", variables.id],
      });
    },
  });
};

/**
 * Hook to delete schedule
 */
export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
    },
  });
};

/**
 * Hook to get hosts (for dropdown)
 */
export const useHosts = () => {
  return useQuery({
    queryKey: ["hosts"],
    queryFn: getHosts,
    staleTime: Infinity, // Hosts rarely change
  });
};

/**
 * Hook to get products (with search)
 */
export const useProducts = (search?: string) => {
  return useQuery({
    queryKey: ["products", search],
    queryFn: () => getProducts(search),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to get vouchers
 */
export const useVouchers = () => {
  return useQuery({
    queryKey: ["vouchers"],
    queryFn: getVouchers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
