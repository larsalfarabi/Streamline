/**
 * Notification Utility Functions
 * Handles Web Push API, permission requests, and service worker registration
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

/**
 * Check if browser supports notifications
 */
export const isNotificationSupported = (): boolean => {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission;
};

/**
 * Request notification permission from user
 */
export const requestNotificationPermission =
  async (): Promise<NotificationPermission> => {
    if (!isNotificationSupported()) {
      throw new Error("Notifications not supported");
    }

    const permission = await Notification.requestPermission();
    return permission;
  };

/**
 * Register service worker
 */
export const registerServiceWorker =
  async (): Promise<ServiceWorkerRegistration> => {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service Worker not supported");
    }

    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    return registration;
  };

/**
 * Subscribe to push notifications
 * For now, we'll skip actual push subscription and just use local notifications
 */
export const subscribeToPush = async (
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> => {
  // If no VAPID key, skip push subscription
  // We'll use local notifications instead
  if (!VAPID_PUBLIC_KEY) {
    console.warn(
      "[Notification] No VAPID key configured. Using local notifications only."
    );
    return null;
  }

  // Convert VAPID public key from base64 to Uint8Array
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  return subscription;
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPush = async (
  registration: ServiceWorkerRegistration
): Promise<boolean> => {
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    return await subscription.unsubscribe();
  }
  return false;
};

/**
 * Get existing push subscription
 */
export const getExistingSubscription = async (
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> => {
  return await registration.pushManager.getSubscription();
};

/**
 * Show a local notification (for testing or in-app notifications)
 */
export const showLocalNotification = async (
  title: string,
  options?: NotificationOptions
): Promise<void> => {
  if (!isNotificationSupported()) {
    throw new Error("Notifications not supported");
  }

  if (Notification.permission === "granted") {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      badge: "/icon-96x96.png",
      icon: "/icon-192x192.png",
      ...options,
    });
  }
};

/**
 * Format schedule notification message
 */
export const formatScheduleNotification = (schedule: {
  title: string;
  platform: string;
  storeName: string;
  minutesUntilStart: number;
}): { title: string; body: string; data: Record<string, unknown> } => {
  const platformNames: Record<string, string> = {
    SHOPEE_LIVE: "Shopee Live",
    TIKTOK_LIVE: "TikTok Live",
    TOKOPEDIA_PLAY: "Tokopedia Play",
    LAZADA_LIVE: "Lazada Live",
  };

  const storeNames: Record<string, string> = {
    GROGLO_BEAUTY: "Groglo Beauty",
    TKIS_HOME_LIVING: "TKIS Home Living",
    PET_JOY: "Pet Joy",
    TIMELESS_BEAUTY: "Timeless Beauty",
    YK_DESIGN: "YK Design",
  };

  return {
    title: `🔴 Live stream ${schedule.minutesUntilStart} menit lagi!`,
    body: `${schedule.title}\n${platformNames[schedule.platform]} - ${
      storeNames[schedule.storeName]
    }`,
    data: {
      url: "/dashboard",
      scheduleId: schedule.title,
    },
  };
};
