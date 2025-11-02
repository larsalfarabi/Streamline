import { axiosInstance } from "@/src/lib/axios";
import type { Schedule, ScheduleDetail } from "@/lib/types";

interface SchedulesResponse {
  success: boolean;
  data: Schedule[];
}

interface ScheduleDetailResponse {
  success: boolean;
  data: ScheduleDetail;
}

interface AcknowledgeResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    acknowledgedAt: string;
  };
}

/**
 * Get all schedules for today
 */
export const getSchedules = async (): Promise<Schedule[]> => {
  const response = await axiosInstance.get<SchedulesResponse>("/api/schedules");
  return response.data.data;
};

/**
 * Get detailed briefing for a specific schedule
 */
export const getScheduleDetail = async (
  id: string
): Promise<ScheduleDetail> => {
  const response = await axiosInstance.get<ScheduleDetailResponse>(
    `/api/schedules/${id}`
  );
  return response.data.data;
};

/**
 * Acknowledge a schedule
 */
export const acknowledgeSchedule = async (
  id: string
): Promise<AcknowledgeResponse["data"]> => {
  const response = await axiosInstance.post<AcknowledgeResponse>(
    `/api/schedules/${id}/acknowledge`
  );
  return response.data.data;
};
