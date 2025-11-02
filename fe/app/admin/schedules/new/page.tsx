"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  Plus,
  X,
  GripVertical,
  Package,
  Ticket,
  Trash2,
} from "lucide-react";
import { useHosts, useCreateSchedule } from "@/src/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PlatformType, Store, Product, Voucher } from "@/lib/types";
import { ProductSearchModal } from "@/src/components/admin/ProductSearchModal";
import { VoucherSelectModal } from "@/src/components/admin/VoucherSelectModal";

// Form validation schema
const scheduleFormSchema = z.object({
  hostId: z.string().min(1, "Host harus dipilih"),
  title: z
    .string()
    .min(3, "Judul minimal 3 karakter")
    .max(100, "Judul maksimal 100 karakter"),
  platform: z.enum([
    "SHOPEE_LIVE",
    "TIKTOK_LIVE",
    "TOKOPEDIA_PLAY",
    "LAZADA_LIVE",
  ]),
  storeName: z.enum([
    "GROGLO_BEAUTY",
    "TKIS_HOME_LIVING",
    "PET_JOY",
    "TIMELESS_BEAUTY",
    "YK_DESIGN",
  ]),
  scheduledAt: z.date(),
  salesTarget: z.string().min(1, "Target penjualan harus diisi"),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

// Platform & Store labels
const platformLabels: Record<PlatformType, string> = {
  SHOPEE_LIVE: "Shopee Live",
  TIKTOK_LIVE: "TikTok Live",
  TOKOPEDIA_PLAY: "Tokopedia Play",
  LAZADA_LIVE: "Lazada Live",
};

const storeLabels: Record<Store, string> = {
  GROGLO_BEAUTY: "Groglo Beauty",
  TKIS_HOME_LIVING: "TKIS Home & Living",
  PET_JOY: "Pet Joy",
  TIMELESS_BEAUTY: "Timeless Beauty",
  YK_DESIGN: "YK Design",
};

export default function NewSchedulePage() {
  const router = useRouter();
  const [selectedProducts, setSelectedProducts] = useState<
    Array<{ product: Product; promoPrice: string }>
  >([]);
  const [selectedVouchers, setSelectedVouchers] = useState<Voucher[]>([]);
  const [talkingPoints, setTalkingPoints] = useState<
    Array<{ text: string; order: number }>
  >([{ text: "", order: 1 }]);

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Fetch master data
  const { data: hosts, isLoading: loadingHosts } = useHosts();

  // Create mutation
  const createMutation = useCreateSchedule();

  // Form
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      hostId: "",
      title: "",
      platform: undefined,
      storeName: undefined,
      scheduledAt: undefined,
      salesTarget: "",
    },
  });

  // Handlers
  const onSubmit = async (values: ScheduleFormValues) => {
    try {
      // Format scheduledAt as ISO datetime string preserving local timezone
      // Using the Date object but formatting manually to avoid UTC conversion
      const year = values.scheduledAt.getFullYear();
      const month = String(values.scheduledAt.getMonth() + 1).padStart(2, "0");
      const day = String(values.scheduledAt.getDate()).padStart(2, "0");
      const hours = String(values.scheduledAt.getHours()).padStart(2, "0");
      const minutes = String(values.scheduledAt.getMinutes()).padStart(2, "0");
      const seconds = "00";

      // Format: YYYY-MM-DDTHH:mm:ss (local time, backend will parse correctly)
      const scheduledAtISO = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

      // Prepare data
      const formData = {
        hostId: parseInt(values.hostId),
        title: values.title,
        platform: values.platform,
        storeName: values.storeName,
        scheduledAt: scheduledAtISO,
        salesTarget: parseFloat(values.salesTarget.replace(/\D/g, "")),
        products: selectedProducts.map((sp) => ({
          productId: sp.product.id,
          promoPrice: parseFloat(sp.promoPrice.replace(/\D/g, "")),
        })),
        vouchers: selectedVouchers.map((v) => ({
          voucherId: v.id,
        })),
        talkingPoints: talkingPoints
          .filter((tp) => tp.text.trim() !== "")
          .map((tp, index) => ({
            text: tp.text,
            order: index + 1,
          })),
      };

      await createMutation.mutateAsync(formData);

      // Success - redirect to dashboard
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Error creating schedule:", error);
      alert("Gagal membuat jadwal. Silakan coba lagi.");
    }
  };

  const addTalkingPoint = () => {
    setTalkingPoints([
      ...talkingPoints,
      { text: "", order: talkingPoints.length + 1 },
    ]);
  };

  const removeTalkingPoint = (index: number) => {
    setTalkingPoints(talkingPoints.filter((_, i) => i !== index));
  };

  const updateTalkingPoint = (index: number, text: string) => {
    const updated = [...talkingPoints];
    updated[index].text = text;
    setTalkingPoints(updated);
  };

  const handleAddProduct = (product: Product, promoPrice: number) => {
    setSelectedProducts([
      ...selectedProducts,
      { product, promoPrice: promoPrice.toString() },
    ]);
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts(
      selectedProducts.filter((sp) => sp.product.id !== productId)
    );
  };

  const handleAddVoucher = (voucher: Voucher) => {
    setSelectedVouchers([...selectedVouchers, voucher]);
  };

  const handleRemoveVoucher = (voucherId: number) => {
    setSelectedVouchers(selectedVouchers.filter((v) => v.id !== voucherId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                📝 Buat Jadwal Baru
              </h1>
              <p className="text-sm text-gray-600">
                Lengkapi form di bawah untuk membuat jadwal live streaming
              </p>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              ← Kembali
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>📋 Informasi Dasar</CardTitle>
                <CardDescription>
                  Pilih host, judul, platform, dan store untuk siaran
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Host Selection */}
                <FormField
                  control={form.control}
                  name="hostId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Host *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Pilih host..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full">
                          {loadingHosts ? (
                            <SelectItem value="loading" disabled>
                              Loading...
                            </SelectItem>
                          ) : (
                            hosts?.map((host) => (
                              <SelectItem
                                key={host.id}
                                value={host.id.toString()}
                              >
                                {host.displayName} (@{host.username})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul Siaran *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Contoh: "Flash Sale Groglo 11.11! 🔥"'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Judul yang menarik dan deskriptif
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Platform & Store */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="Pilih platform..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="w-full">
                            {Object.entries(platformLabels).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="storeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="Pilih store..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="w-full">
                            {Object.entries(storeLabels).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Scheduled At & Sales Target */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="scheduledAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tanggal & Waktu *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal h-10",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd MMM yyyy, HH:mm")
                                ) : (
                                  <span>Pilih tanggal & waktu</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                            <div className="p-3 border-t">
                              <Label className="text-sm font-medium">
                                Waktu
                              </Label>
                              <div className="flex items-center gap-2 mt-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="23"
                                  placeholder="HH"
                                  value={
                                    field.value ? format(field.value, "HH") : ""
                                  }
                                  onChange={(e) => {
                                    const hours = parseInt(e.target.value) || 0;
                                    const newDate = field.value || new Date();
                                    newDate.setHours(hours);
                                    field.onChange(newDate);
                                  }}
                                  className="w-16 text-center"
                                />
                                <span className="font-medium">:</span>
                                <Input
                                  type="number"
                                  min="0"
                                  max="59"
                                  placeholder="MM"
                                  value={
                                    field.value ? format(field.value, "mm") : ""
                                  }
                                  onChange={(e) => {
                                    const minutes =
                                      parseInt(e.target.value) || 0;
                                    const newDate = field.value || new Date();
                                    newDate.setMinutes(minutes);
                                    field.onChange(newDate);
                                  }}
                                  className="w-16 text-center"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Format 24 jam (00:00 - 23:59)
                              </p>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salesTarget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Penjualan *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Contoh: 5000000"
                            {...field}
                            onChange={(e) => {
                              // Format as currency
                              const value = e.target.value.replace(/\D/g, "");
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value &&
                            `Rp ${parseInt(
                              field.value.replace(/\D/g, "") || "0"
                            ).toLocaleString("id-ID")}`}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Products Section */}
            <Card>
              <CardHeader>
                <CardTitle>🛍️ Produk</CardTitle>
                <CardDescription>
                  Tambahkan produk yang akan dijual dengan harga promo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedProducts.length > 0 ? (
                  <div className="space-y-3">
                    {selectedProducts.map((sp) => (
                      <div
                        key={sp.product.id}
                        className="flex items-start justify-between p-4 border rounded-lg bg-gray-50"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <Package className="h-5 w-5 text-gray-400 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {sp.product.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              SKU: {sp.product.sku}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-gray-500 line-through">
                                Rp{" "}
                                {sp.product.defaultPrice?.toLocaleString(
                                  "id-ID"
                                ) || "-"}
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                Rp{" "}
                                {parseInt(sp.promoPrice || "0").toLocaleString(
                                  "id-ID"
                                )}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                Hemat Rp{" "}
                                {(
                                  (sp.product.defaultPrice || 0) -
                                  parseInt(sp.promoPrice || "0")
                                ).toLocaleString("id-ID")}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveProduct(sp.product.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Belum ada produk ditambahkan</p>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowProductModal(true)}
                  className="w-full mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Produk
                </Button>
              </CardContent>
            </Card>

            {/* Vouchers Section */}
            <Card>
              <CardHeader>
                <CardTitle>🎫 Voucher</CardTitle>
                <CardDescription>
                  Tambahkan voucher yang berlaku untuk siaran ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedVouchers.length > 0 ? (
                  <div className="space-y-3">
                    {selectedVouchers.map((voucher) => (
                      <div
                        key={voucher.id}
                        className="flex items-start justify-between p-4 border rounded-lg bg-gray-50"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <Ticket className="h-5 w-5 text-gray-400 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {voucher.code}
                            </h4>
                            {voucher.description && (
                              <p className="text-sm text-gray-600">
                                {voucher.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge>
                                {voucher.discountType === "PERCENTAGE"
                                  ? `${voucher.discountValue || 0}%`
                                  : `Rp ${(
                                      voucher.discountValue || 0
                                    ).toLocaleString("id-ID")}`}
                              </Badge>
                              {voucher.minPurchaseAmount &&
                                voucher.minPurchaseAmount > 0 && (
                                  <span className="text-xs text-gray-500">
                                    Min: Rp{" "}
                                    {voucher.minPurchaseAmount.toLocaleString(
                                      "id-ID"
                                    )}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVoucher(voucher.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Ticket className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Belum ada voucher ditambahkan</p>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowVoucherModal(true)}
                  className="w-full mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Voucher
                </Button>
              </CardContent>
            </Card>

            {/* Talking Points */}
            <Card>
              <CardHeader>
                <CardTitle>💬 Talking Points</CardTitle>
                <CardDescription>
                  Poin-poin penting yang harus disampaikan oleh host
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {talkingPoints.map((tp, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex items-center gap-2 mt-2">
                      <GripVertical className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600 min-w-5">
                        {index + 1}.
                      </span>
                    </div>
                    <Textarea
                      placeholder="Contoh: Highlight: Serum Groglo adalah produk #1 Best Seller bulan ini! 🏆"
                      value={tp.text}
                      onChange={(e) =>
                        updateTalkingPoint(index, e.target.value)
                      }
                      rows={2}
                      className="flex-1"
                    />
                    {talkingPoints.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTalkingPoint(index)}
                        className="mt-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTalkingPoint}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Talking Point
                </Button>
              </CardContent>
            </Card>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-blue-600"
              >
                {createMutation.isPending ? "Menyimpan..." : "💾 Simpan Jadwal"}
              </Button>
            </div>
          </form>
        </Form>
      </main>

      {/* Modals */}
      <ProductSearchModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        selectedProducts={selectedProducts}
        onAddProduct={handleAddProduct}
      />
      <VoucherSelectModal
        open={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        selectedVouchers={selectedVouchers}
        onAddVoucher={handleAddVoucher}
      />
    </div>
  );
}
