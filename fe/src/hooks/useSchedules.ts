import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSchedules,
  getScheduleDetail,
  acknowledgeSchedule,
} from "@/src/services/schedule.service";
import type { Schedule, ScheduleDetail } from "@/lib/types";

/**
 * Hook untuk fetch semua schedules hari ini
 */
export const useSchedules = () => {
  return useQuery<Schedule[], Error>({
    queryKey: ["schedules"],
    queryFn: getSchedules,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook untuk fetch detail schedule
 */
export const useScheduleDetail = (id: string | null) => {
  return useQuery<ScheduleDetail, Error>({
    queryKey: ["schedule", id],
    queryFn: () => getScheduleDetail(id!),
    enabled: !!id, // Only run query jika id ada
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook untuk acknowledge schedule
 */
export const useAcknowledgeSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acknowledgeSchedule,
    onSuccess: (data, scheduleId) => {
      // Invalidate queries untuk trigger refetch
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedule", scheduleId] });

      // Atau update cache secara optimistic
      queryClient.setQueryData<Schedule[]>(["schedules"], (old) => {
        if (!old) return old;
        return old.map((schedule) =>
          schedule.id === scheduleId
            ? { ...schedule, acknowledgedAt: data.acknowledgedAt }
            : schedule
        );
      });
    },
  });
};
