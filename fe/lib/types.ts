export type PlatformType =
  | "SHOPEE_LIVE"
  | "TIKTOK_LIVE"
  | "TOKOPEDIA_PLAY"
  | "LAZADA_LIVE";
export type Store =
  | "GROGLO_BEAUTY"
  | "TKIS_HOME_LIVING"
  | "PET_JOY"
  | "TIMELESS_BEAUTY"
  | "YK_DESIGN";
export type UserRole = "HOST" | "ADMIN";

export interface User {
  id: number;
  username: string;
  displayName: string;
  role: UserRole;
}

export interface Schedule {
  id: string;
  title: string;
  platform: PlatformType;
  storeName: Store;
  scheduledAt: string;
  salesTarget: number;
  acknowledgedAt: string | null;
}

// Admin schedule with host info
export interface AdminSchedule extends Schedule {
  host: {
    id: number;
    displayName: string;
    username: string;
  };
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  defaultPrice: number;
  stock: number;
  promoPrice?: number; // Optional for admin form
}

export interface Voucher {
  id: number;
  code: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minPurchaseAmount: number | null;
  maxDiscountAmount: number | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export interface TalkingPoint {
  id: number;
  text: string;
  order: number;
}

export interface ScheduleDetail extends Schedule {
  products: Product[];
  vouchers: Voucher[];
  talkingPoints: TalkingPoint[];
}

// Admin schedule detail with full nested data
export interface AdminScheduleDetail {
  id: string;
  title: string;
  platform: PlatformType;
  storeName: Store;
  scheduledAt: string;
  salesTarget: number;
  acknowledgedAt: string | null;
  host: {
    id: number;
    displayName: string;
    username: string;
  };
  products: Array<{
    productId: number;
    promoPrice: number;
    product: Product;
  }>;
  vouchers: Array<{
    voucherId: number;
    voucher: Voucher;
  }>;
  talkingPoints: TalkingPoint[];
}

// Form data for creating/updating schedule
export interface ScheduleFormData {
  hostId: number;
  title: string;
  platform: PlatformType;
  storeName: Store;
  scheduledAt: string;
  salesTarget: number;
  products: Array<{
    productId: number;
    promoPrice: number;
  }>;
  vouchers: Array<{
    voucherId: number;
  }>;
  talkingPoints: Array<{
    text: string;
    order: number;
  }>;
}
