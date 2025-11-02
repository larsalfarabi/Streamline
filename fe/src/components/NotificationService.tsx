"use client";

import { useEffect } from "react";
import { useUpcomingSchedules } from "@/src/hooks/useNotifications";
import { useNotificationPreferences } from "@/src/hooks/useNotifications";
import {
  showLocalNotification,
  formatScheduleNotification,
} from "@/src/lib/notification";

/**
 * Background service to check upcoming schedules and show notifications
 * This component doesn't render anything, just runs in the background
 */
export function NotificationService() {
  const { data: upcomingSchedules } = useUpcomingSchedules();
  const { data: preferences } = useNotificationPreferences();

  useEffect(() => {
    if (!preferences?.enabled || !upcomingSchedules) return;

    // Check if we need to show notifications
    upcomingSchedules.forEach(async (schedule) => {
      // Only notify if within the notification window (e.g., exactly 15 minutes before)
      const minutesUntilStart = schedule.minutesUntilStart;
      const targetMinutes = preferences.minutesBefore || 15;

      // Show notification if we're within 1 minute of the target time
      // This prevents showing the same notification multiple times
      if (
        minutesUntilStart <= targetMinutes &&
        minutesUntilStart > targetMinutes - 1
      ) {
        const notification = formatScheduleNotification(schedule);

        try {
          await showLocalNotification(notification.title, {
            body: notification.body,
            data: notification.data,
            tag: `schedule-${schedule.id}`, // Prevents duplicate notifications
            requireInteraction: true,
          });
        } catch (error) {
          console.error("Failed to show notification:", error);
        }
      }
    });
  }, [upcomingSchedules, preferences]);

  // This component doesn't render anything
  return null;
}
