"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatCurrency,
  formatTime,
  formatDateTime,
  getPlatformLabel,
  getStoreLabel,
  getPlatformColor,
} from "@/lib/utils";
import {
  useSchedules,
  useScheduleDetail,
  useAcknowledgeSchedule,
} from "@/src/hooks/useSchedules";
import { NotificationBanner } from "@/src/components/NotificationComponents";
import { Settings } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null
  );

  console.log("Data Session:", session);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showNotificationBanner, setShowNotificationBanner] = useState(true);

  // React Query hooks
  const { data: schedules, isLoading } = useSchedules();
  const { data: selectedSchedule } = useScheduleDetail(selectedScheduleId);
  const acknowledgeMutation = useAcknowledgeSchedule();


  // Redirect to login jika belum autentikasi
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleScheduleClick = (scheduleId: string) => {
    setSelectedScheduleId(scheduleId);
    setIsDialogOpen(true);
  };

  const handleAcknowledge = () => {
    if (!selectedScheduleId) return;

    acknowledgeMutation.mutate(selectedScheduleId, {
      onSuccess: () => {
        // Modal akan otomatis update karena React Query invalidate cache
      },
    });
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Streamline</h1>
            <p className="text-sm text-gray-600">
              Selamat datang, {session?.user?.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/settings")}
              title="Pengaturan"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Notification Banner - Human-Centered Design */}
        {showNotificationBanner && (
          <NotificationBanner
            onDismiss={() => setShowNotificationBanner(false)}
          />
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Jadwal Livestream
          </h2>
          <p className="text-sm text-gray-600">
            Menampilkan semua jadwal mendatang
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat jadwal...</p>
          </div>
        ) : !schedules || schedules.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 text-lg">
                Tidak ada jadwal mendatang.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Nikmati waktu istirahat Anda! 🎉
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <Card
                key={schedule.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleScheduleClick(schedule.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {schedule.title}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap gap-2 items-center">
                        <Badge className={getPlatformColor(schedule.platform)}>
                          {getPlatformLabel(schedule.platform)}
                        </Badge>
                        <span className="text-gray-600">
                          {getStoreLabel(schedule.storeName)}
                        </span>
                      </CardDescription>
                    </div>
                    {schedule.acknowledgedAt && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        ✓ Terkonfirmasi
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-gray-600">Waktu:</span>{" "}
                        <span className="font-medium">
                          {formatDateTime(schedule.scheduledAt)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Target:</span>{" "}
                        <span className="font-medium">
                          {formatCurrency(Number(schedule.salesTarget))}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Lihat Detail →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Briefing Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedSchedule && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedSchedule.title}
                </DialogTitle>
                <DialogDescription className="flex flex-wrap gap-2 items-center mt-2">
                  <Badge
                    className={getPlatformColor(selectedSchedule.platform)}
                  >
                    {getPlatformLabel(selectedSchedule.platform)}
                  </Badge>
                  <span>{getStoreLabel(selectedSchedule.storeName)}</span>
                  <span>•</span>
                  <span>{formatTime(selectedSchedule.scheduledAt)}</span>
                  <span>•</span>
                  <span className="font-semibold">
                    Target:{" "}
                    {formatCurrency(Number(selectedSchedule.salesTarget))}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Products */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">
                    📦 Produk ({selectedSchedule.products.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedSchedule.products.map((product) => (
                      <div
                        key={product.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            SKU: {product.sku}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 text-lg">
                            {formatCurrency(Number(product.promoPrice))}
                          </p>
                          <p className="text-xs text-gray-500 line-through">
                            {formatCurrency(Number(product.defaultPrice))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vouchers */}
                {selectedSchedule.vouchers.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">
                      🎟️ Voucher ({selectedSchedule.vouchers.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedSchedule.vouchers.map((voucher) => (
                        <div
                          key={voucher.id}
                          className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                        >
                          <p className="font-mono font-bold text-yellow-800">
                            {voucher.code}
                          </p>
                          <p className="text-sm text-gray-700">
                            {voucher.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Talking Points */}
                {selectedSchedule.talkingPoints.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">
                      💬 Key Talking Points
                    </h3>
                    <ol className="space-y-2 list-decimal list-inside">
                      {selectedSchedule.talkingPoints.map((point) => (
                        <li key={point.id} className="text-gray-700">
                          {point.text}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Acknowledge Button */}
                <div className="pt-4 border-t">
                  {selectedSchedule.acknowledgedAt ? (
                    <div className="text-center py-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">
                        ✓ Terkonfirmasi pada{" "}
                        {new Date(
                          selectedSchedule.acknowledgedAt
                        ).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ) : (
                    <Button
                      className="w-full h-12 text-base font-semibold"
                      onClick={handleAcknowledge}
                      disabled={acknowledgeMutation.isPending}
                    >
                      {acknowledgeMutation.isPending
                        ? "Mengkonfirmasi..."
                        : "Saya Siap Siaran 🚀"}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
