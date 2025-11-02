import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  getUpcomingSchedules,
} from "@/src/services/notification.service";
import {
  registerServiceWorker,
  subscribeToPush,
  unsubscribeFromPush,
  getExistingSubscription,
  requestNotificationPermission,
  isNotificationSupported,
} from "@/src/lib/notification";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

/**
 * Hook untuk get notification preferences
 * Only fetches when user is authenticated
 */
export const useNotificationPreferences = () => {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: ["notificationPreferences"],
    queryFn: getNotificationPreferences,
    enabled: status === "authenticated" && !!session, // Only fetch when authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook untuk update notification preferences
 */
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });
    },
  });
};

/**
 * Hook untuk enable/disable notifications
 */
export const useNotificationToggle = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const enableNotifications = async () => {
    setIsProcessing(true);
    try {
      // 1. Request permission
      const permission = await requestNotificationPermission();
      if (permission !== "granted") {
        throw new Error("Permission denied");
      }

      // 2. Register service worker
      const registration = await registerServiceWorker();

      // 3. Subscribe to push (may be null if no VAPID key)
      const subscription = await subscribeToPush(registration);

      // 4. Send subscription to backend (null is OK for local notifications)
      await subscribeToNotifications(subscription as PushSubscription, {
        enabled: true,
        minutesBefore: 15,
        sound: true,
      });

      // 5. Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });

      return { success: true };
    } catch (error) {
      console.error("Enable notifications error:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const disableNotifications = async () => {
    setIsProcessing(true);
    try {
      // 1. Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // 2. Unsubscribe from push
      await unsubscribeFromPush(registration);

      // 3. Update backend
      await unsubscribeFromNotifications();

      // 4. Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });

      return { success: true };
    } catch (error) {
      console.error("Disable notifications error:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    enableNotifications,
    disableNotifications,
    isProcessing,
  };
};

/**
 * Hook untuk check notification status
 */
export const useNotificationStatus = () => {
  const [status, setStatus] = useState({
    isSupported: false,
    permission: "default" as NotificationPermission,
    hasSubscription: false,
  });

  useEffect(() => {
    const checkStatus = async () => {
      const supported = isNotificationSupported();

      if (!supported) {
        setStatus({
          isSupported: false,
          permission: "denied",
          hasSubscription: false,
        });
        return;
      }

      const permission = Notification.permission;

      let hasSubscription = false;
      if (permission === "granted") {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await getExistingSubscription(registration);
          hasSubscription = !!subscription;
        } catch (error) {
          console.error("Check subscription error:", error);
        }
      }

      setStatus({
        isSupported: supported,
        permission,
        hasSubscription,
      });
    };

    checkStatus();
  }, []);

  return status;
};

/**
 * Hook untuk get upcoming schedules (for notification preview)
 * Only fetches when user is authenticated
 */
export const useUpcomingSchedules = () => {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: ["upcomingSchedules"],
    queryFn: getUpcomingSchedules,
    enabled: status === "authenticated" && !!session, // Only fetch when authenticated
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};
