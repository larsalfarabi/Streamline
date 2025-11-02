"use client";

import { useState } from "react";
import { Search, Plus, Check, Package } from "lucide-react";
import { useProducts } from "@/src/hooks/useAdmin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { Product } from "@/lib/types";

interface ProductWithPromo {
  product: Product;
  promoPrice: string;
}

interface ProductSearchModalProps {
  open: boolean;
  onClose: () => void;
  selectedProducts: ProductWithPromo[];
  onAddProduct: (product: Product, promoPrice: number) => void;
}

export function ProductSearchModal({
  open,
  onClose,
  selectedProducts,
  onAddProduct,
}: ProductSearchModalProps) {
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [promoPrice, setPromoPrice] = useState("");

  const { data: products, isLoading } = useProducts(search);

  const handleAdd = () => {
    if (selectedProduct && promoPrice) {
      const promoPriceNum = parseFloat(promoPrice.replace(/\D/g, ""));
      if (promoPriceNum > 0) {
        onAddProduct(selectedProduct, promoPriceNum);
        setSelectedProduct(null);
        setPromoPrice("");
        onClose();
      }
    }
  };

  const isProductSelected = (productId: number) => {
    return selectedProducts.some((sp) => sp.product.id === productId);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>🛍️ Pilih Produk</DialogTitle>
          <DialogDescription>
            Cari dan pilih produk yang akan dijual dalam siaran ini
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Search */}
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama produk atau SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Product List - Scrollable */}
          <div className="flex-1 border rounded-lg overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : products && products.length > 0 ? (
              <div className="divide-y">
                {products.map((product) => {
                  const alreadySelected = isProductSelected(product.id);
                  const isSelected = selectedProduct?.id === product.id;

                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        if (!alreadySelected) {
                          setSelectedProduct(product);
                          setPromoPrice("");
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
                            <Package className="h-4 w-4 text-gray-400" />
                            <h4 className="font-medium text-gray-900">
                              {product.name}
                            </h4>
                            {alreadySelected && (
                              <Badge variant="secondary" className="text-xs">
                                <Check className="h-3 w-3 mr-1" />
                                Sudah dipilih
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            SKU: {product.sku}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-sm font-medium text-gray-700">
                              Harga Normal: Rp{" "}
                              {product.defaultPrice?.toLocaleString("id-ID") ||
                                "-"}
                            </span>
                            <Badge variant="outline">
                              Stok: {product.stock ?? 0}
                            </Badge>
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
                <Package className="h-12 w-12 mb-2 opacity-20" />
                <p>
                  {search
                    ? "Tidak ada produk yang ditemukan"
                    : "Mulai ketik untuk mencari produk"}
                </p>
              </div>
            )}
          </div>

          {/* Promo Price Input */}
          {selectedProduct && (
            <div className="border rounded-lg p-4 bg-blue-50 shrink-0">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Produk Dipilih: {selectedProduct.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Harga Normal: Rp{" "}
                    {selectedProduct.defaultPrice?.toLocaleString("id-ID") ||
                      "-"}
                  </p>
                </div>
                <div>
                  <Label htmlFor="promoPrice">Harga Promo *</Label>
                  <Input
                    id="promoPrice"
                    type="text"
                    placeholder="Contoh: 150000"
                    value={promoPrice}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setPromoPrice(value);
                    }}
                    className="mt-1"
                  />
                  {promoPrice && (
                    <p className="text-sm text-gray-600 mt-1">
                      Rp{" "}
                      {parseInt(
                        promoPrice.replace(/\D/g, "") || "0"
                      ).toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 shrink-0 pt-2 border-t">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!selectedProduct || !promoPrice}
              className="bg-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Produk
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
