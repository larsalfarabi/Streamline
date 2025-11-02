"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, BellOff, Clock, Volume2 } from "lucide-react";
import {
  useNotificationToggle,
  useNotificationStatus,
} from "@/src/hooks/useNotifications";

interface NotificationBannerProps {
  onDismiss?: () => void;
}

/**
 * Human-Centered Design: Friendly banner to request notification permission
 * Shows on first login, non-intrusive, explains benefits clearly
 */
export function NotificationBanner({ onDismiss }: NotificationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { enableNotifications, isProcessing } = useNotificationToggle();
  const { isSupported, permission } = useNotificationStatus();

  // Don't show if:
  // - Not supported by browser
  // - Already granted
  // - User dismissed
  if (!isSupported || permission === "granted" || isDismissed) {
    return null;
  }

  const handleEnable = async () => {
    try {
      await enableNotifications();
      setIsDismissed(true);
      onDismiss?.();
    } catch (error) {
      console.error("Failed to enable notifications:", error);
      // Show friendly error message
      alert(
        "Tidak bisa mengaktifkan notifikasi. Pastikan Anda mengizinkan notifikasi di browser."
      );
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-500 p-2">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">
              Aktifkan Pengingat Siaran 🔔
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-gray-600">
              Dapatkan notifikasi 15 menit sebelum jadwal live stream Anda
              dimulai
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>Tidak akan ketinggalan jadwal siaran</span>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-500" />
            <span>Siap siaran tepat waktu setiap hari</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          onClick={handleEnable}
          disabled={isProcessing}
          className="flex-1"
        >
          {isProcessing ? "Mengaktifkan..." : "Ya, Aktifkan Reminder"}
        </Button>
        <Button variant="ghost" onClick={handleDismiss} className="flex-1">
          Nanti Saja
        </Button>
      </CardFooter>
    </Card>
  );
}

interface NotificationSettingsCardProps {
  preferences: {
    enabled: boolean;
    minutesBefore: number;
    sound: boolean;
  };
  onUpdate: (preferences: {
    enabled?: boolean;
    minutesBefore?: number;
    sound?: boolean;
  }) => void;
  isUpdating?: boolean;
}

/**
 * Settings card for notification preferences
 */
export function NotificationSettingsCard({
  preferences,
  onUpdate,
  isUpdating,
}: NotificationSettingsCardProps) {
  const { disableNotifications, enableNotifications, isProcessing } =
    useNotificationToggle();

  const handleToggle = async () => {
    try {
      if (preferences.enabled) {
        await disableNotifications();
      } else {
        await enableNotifications();
      }
    } catch (error) {
      console.error("Toggle notification error:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {preferences.enabled ? (
              <Bell className="h-5 w-5 text-green-500" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <CardTitle className="text-base">Pengingat Siaran</CardTitle>
              <CardDescription className="text-sm">
                {preferences.enabled ? "Aktif" : "Nonaktif"}
              </CardDescription>
            </div>
          </div>
          <Button
            variant={preferences.enabled ? "destructive" : "default"}
            size="sm"
            onClick={handleToggle}
            disabled={isProcessing}
          >
            {isProcessing
              ? "..."
              : preferences.enabled
              ? "Matikan"
              : "Aktifkan"}
          </Button>
        </div>
      </CardHeader>

      {preferences.enabled && (
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Ingatkan saya sebelum siaran
            </label>
            <div className="mt-2 flex gap-2">
              {[15, 30, 60].map((minutes) => (
                <Button
                  key={minutes}
                  variant={
                    preferences.minutesBefore === minutes
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => onUpdate({ minutesBefore: minutes })}
                  disabled={isUpdating}
                >
                  {minutes} menit
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Suara notifikasi</span>
            </div>
            <Button
              variant={preferences.sound ? "default" : "outline"}
              size="sm"
              onClick={() => onUpdate({ sound: !preferences.sound })}
              disabled={isUpdating}
            >
              {preferences.sound ? "Aktif" : "Nonaktif"}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
