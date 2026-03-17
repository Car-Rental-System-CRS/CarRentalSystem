export type DiscountCampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'ENDED';
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type DiscountTargetingMode = 'ALL_RENTERS' | 'FILTERED_RENTERS';

export interface DiscountCampaign {
  id: string;
  name: string;
  description: string;
  status: DiscountCampaignStatus;
  discountType: DiscountType;
  discountValue: number;
  minimumBookingAmount: number | null;
  maximumDiscountAmount: number | null;
  validFrom: string;
  validUntil: string;
  targetingMode: DiscountTargetingMode;
  targetAccountIds: string[];
  couponQuantity: number;
  generatedCouponCount: number;
  usageLimitPerCoupon: number;
  createdAt: string;
  modifiedAt: string;
}

export interface CouponSummary {
  id: string;
  campaignId: string;
  code: string;
  status: 'AVAILABLE' | 'RESERVED' | 'REDEEMED' | 'EXPIRED' | 'CANCELLED';
  usageLimit: number;
  usageCount: number;
  eligibleAccountId: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreateDiscountCampaignRequest {
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minimumBookingAmount?: number | null;
  maximumDiscountAmount?: number | null;
  validFrom: string;
  validUntil: string;
  targetingMode: DiscountTargetingMode;
  targetAccountIds?: string[];
  couponQuantity: number;
  usageLimitPerCoupon: number;
}

export interface GenerateCouponsRequest {
  quantity?: number;
  eligibleAccountIds?: string[];
}

export interface DiscountNotificationItem {
  id: string;
  campaignId: string;
  title: string;
  message: string;
  couponCode: string | null;
  read: boolean;
  validUntil: string;
  createdAt: string;
  unreadCount?: number | null;
}

export interface DiscountNotificationEvent {
  type: 'connected' | 'notification';
  notification?: DiscountNotificationItem;
}
