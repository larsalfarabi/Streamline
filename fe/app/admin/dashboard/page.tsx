"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useAdminSchedules } from "@/src/hooks/useAdmin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AdminSchedule, PlatformType } from "@/lib/types";

// Platform badges with colors
const platformColors: Record<PlatformType, string> = {
  SHOPEE_LIVE: "bg-orange-100 text-orange-800",
  TIKTOK_LIVE: "bg-pink-100 text-pink-800",
  TOKOPEDIA_PLAY: "bg-green-100 text-green-800",
  LAZADA_LIVE: "bg-blue-100 text-blue-800",
};

// Platform labels
const platformLabels: Record<PlatformType, string> = {
  SHOPEE_LIVE: "Shopee Live",
  TIKTOK_LIVE: "TikTok Live",
  TOKOPEDIA_PLAY: "Tokopedia Play",
  LAZADA_LIVE: "Lazada Live",
};

// Store labels
const storeLabels: Record<string, string> = {
  GROGLO_BEAUTY: "Groglo Beauty",
  TKIS_HOME_LIVING: "TKIS Home & Living",
  PET_JOY: "Pet Joy",
  TIMELESS_BEAUTY: "Timeless Beauty",
  YK_DESIGN: "YK Design",
};

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Convert date to string for API call (using local timezone, not UTC)
  const selectedDate = date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`
    : (() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(now.getDate()).padStart(2, "0")}`;
      })();

  // Fetch schedules with optional date filter
  const { data: schedules, isLoading } = useAdminSchedules({
    date: selectedDate,
  });

  const handleCreateNew = () => {
    router.push("/admin/schedules/new");
  };

  const handleEditSchedule = (scheduleId: string) => {
    router.push(`/admin/schedules/${scheduleId}`);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const formatTime = (dateString: string) => {
    // Parse the datetime string as local time
    const date = new Date(dateString);
    // Format using local timezone
    return format(date, "HH:mm", { locale: localeId });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  🎯 Streamline Admin
                </h1>
                <p className="text-sm text-gray-600">
                  Kelola jadwal live streaming
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{session?.user?.name}</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <div className="font-medium">{session?.user?.name}</div>
                    <div className="text-xs text-gray-500">
                      Role: {session?.user?.role}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  🚪 Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                📅 Filter Tanggal:
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-60 justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      format(date, "PPP", { locale: localeId })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {schedules && schedules.length > 0 && (
              <div className="text-sm text-gray-600 mt-5">
                Menampilkan{" "}
                <span className="font-semibold">{schedules.length}</span> jadwal
              </div>
            )}
          </div>

          <Button onClick={handleCreateNew}>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Buat Jadwal Baru
          </Button>
        </div>

        {/* Schedules List */}
        {isLoading ? (
          <Card className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </Card>
        ) : schedules && schedules.length > 0 ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jadwal</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule: AdminSchedule) => (
                  <TableRow key={schedule.id}>
                    {/* Title */}
                    <TableCell className="font-medium">
                      {schedule.title}
                    </TableCell>

                    {/* Host */}
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {schedule.host.displayName}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{schedule.host.username}
                        </div>
                      </div>
                    </TableCell>

                    {/* Platform */}
                    <TableCell>
                      <Badge className={platformColors[schedule.platform]}>
                        {platformLabels[schedule.platform]}
                      </Badge>
                    </TableCell>

                    {/* Store */}
                    <TableCell className="text-sm">
                      {storeLabels[schedule.storeName]}
                    </TableCell>

                    {/* Time */}
                    <TableCell className="text-sm">
                      {formatTime(schedule.scheduledAt)}
                    </TableCell>

                    {/* Sales Target */}
                    <TableCell className="text-sm">
                      {formatCurrency(schedule.salesTarget)}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {schedule.acknowledgedAt ? (
                        <Badge className="bg-green-100 text-green-800">
                          ✓ Acknowledged
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          ⏳ Pending
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleEditSchedule(schedule.id)}
                          >
                            ✏️ Edit Jadwal
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(schedule.id);
                            }}
                          >
                            📋 Copy ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            🗑️ Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada jadwal
            </h3>
            <p className="text-gray-600 mb-6">
              Belum ada jadwal untuk tanggal yang dipilih.
            </p>
            <Button onClick={handleCreateNew}>+ Buat Jadwal Baru</Button>
          </Card>
        )}
      </main>
    </div>
  );
}
