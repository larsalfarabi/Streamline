"use client";

import { useState } from "react";
import { Ticket, Plus, Check } from "lucide-react";
import { useVouchers } from "@/src/hooks/useAdmin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Voucher } from "@/lib/types";

interface VoucherSelectModalProps {
  open: boolean;
  onClose: () => void;
  selectedVouchers: Voucher[];
  onAddVoucher: (voucher: Voucher) => void;
}

export function VoucherSelectModal({
  open,
  onClose,
  selectedVouchers,
  onAddVoucher,
}: VoucherSelectModalProps) {
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const { data: vouchers, isLoading } = useVouchers();

  const handleAdd = () => {
    if (selectedVoucher) {
      onAddVoucher(selectedVoucher);
      setSelectedVoucher(null);
      onClose();
    }
  };

  const isVoucherSelected = (voucherId: number) => {
    return selectedVouchers.some((v) => v.id === voucherId);
  };

  const getDiscountLabel = (voucher: Voucher) => {
    if (!voucher.discountValue) return "-";

    if (voucher.discountType === "PERCENTAGE") {
      return `${voucher.discountValue}%`;
    }
    return `Rp ${voucher.discountValue.toLocaleString("id-ID")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>🎫 Pilih Voucher</DialogTitle>
          <DialogDescription>
            Pilih voucher yang akan ditampilkan dalam siaran ini
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Voucher List - Scrollable */}
          <div className="flex-1 border rounded-lg overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : vouchers && vouchers.length > 0 ? (
              <div className="divide-y">
                {vouchers.map((voucher) => {
                  const alreadySelected = isVoucherSelected(voucher.id);
                  const isSelected = selectedVoucher?.id === voucher.id;

                  return (
                    <div
                      key={voucher.id}
                      onClick={() => {
                        if (!alreadySelected) {
                          setSelectedVoucher(voucher);
                        }
                      }}
                      className={`p-4 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50 border-l-4 border-blue-600"
                          : alreadySelected
                          ? "bg-gray-50 opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-gray-400" />
                            <h4 className="font-medium text-gray-900">
                              {voucher.code}
                            </h4>
                            {alreadySelected && (
                              <Badge variant="secondary" className="text-xs">
                                <Check className="h-3 w-3 mr-1" />
                                Sudah dipilih
                              </Badge>
                            )}
                          </div>
                          {voucher.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {voucher.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <Badge>{getDiscountLabel(voucher)}</Badge>
                            {voucher.minPurchaseAmount &&
                              voucher.minPurchaseAmount > 0 && (
                                <span className="text-xs text-gray-500">
                                  Min: Rp{" "}
                                  {voucher.minPurchaseAmount.toLocaleString(
                                    "id-ID"
                                  )}
                                </span>
                              )}
                            {voucher.maxDiscountAmount &&
                              voucher.maxDiscountAmount > 0 && (
                                <span className="text-xs text-gray-500">
                                  Max: Rp{" "}
                                  {voucher.maxDiscountAmount.toLocaleString(
                                    "id-ID"
                                  )}
                                </span>
                              )}
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            {voucher.validFrom && voucher.validUntil && (
                              <span>
                                Valid:{" "}
                                {new Date(voucher.validFrom).toLocaleDateString(
                                  "id-ID"
                                )}{" "}
                                -{" "}
                                {new Date(
                                  voucher.validUntil
                                ).toLocaleDateString("id-ID")}
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="ml-4">
                            <Check className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <Ticket className="h-12 w-12 mb-2 opacity-20" />
                <p>Tidak ada voucher tersedia</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 shrink-0 pt-2 border-t">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!selectedVoucher}
              className="bg-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Voucher
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
