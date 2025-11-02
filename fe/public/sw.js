// Service Worker for Push Notifications
// This file handles push events and notification clicks

// Install event - cache static assets
self.addEventListener("install", () => {
  console.log("[SW] Installing service worker...");
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");
  event.waitUntil(self.clients.claim());
});

// Push event - show notification
self.addEventListener("push", (event) => {
  console.log("[SW] Push received:", event);

  let data = {
    title: "🔴 Streamline Notification",
    body: "You have a new notification",
    icon: "/icon-192x192.png",
    badge: "/icon-96x96.png",
    data: {
      url: "/dashboard",
    },
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      console.error("[SW] Error parsing push data:", e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192x192.png",
    badge: data.badge || "/icon-96x96.png",
    tag: "streamline-notification",
    requireInteraction: true, // Keep notification visible until user interacts
    data: data.data,
    actions: [
      {
        action: "open",
        title: "Buka Dashboard",
      },
      {
        action: "close",
        title: "Tutup",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }

        // If not, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Message event - for communication with main app
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
