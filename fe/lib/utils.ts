import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PlatformType, Store } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getPlatformLabel(platform: PlatformType): string {
  const labels: Record<PlatformType, string> = {
    SHOPEE_LIVE: "Shopee Live",
    TIKTOK_LIVE: "TikTok Live",
    TOKOPEDIA_PLAY: "Tokopedia Play",
    LAZADA_LIVE: "Lazada Live",
  };
  return labels[platform] || platform;
}

export function getStoreLabel(store: Store): string {
  const labels: Record<Store, string> = {
    GROGLO_BEAUTY: "Groglo Beauty",
    TKIS_HOME_LIVING: "TKIS Home & Living",
    PET_JOY: "Pet Joy",
    TIMELESS_BEAUTY: "Timeless Beauty",
    YK_DESIGN: "YK Design",
  };
  return labels[store] || store;
}

export function getPlatformColor(platform: PlatformType): string {
  const colors: Record<PlatformType, string> = {
    SHOPEE_LIVE: "bg-orange-100 text-orange-800",
    TIKTOK_LIVE: "bg-black text-white",
    TOKOPEDIA_PLAY: "bg-green-100 text-green-800",
    LAZADA_LIVE: "bg-blue-100 text-blue-800",
  };
  return colors[platform] || "bg-gray-100 text-gray-800";
}
