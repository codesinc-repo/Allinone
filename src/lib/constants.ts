export const USER_ROLES = ["USER", "ADMIN", "PROVIDER", "SELLER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const MODULES = [
  "RECHARGE",
  "MARKETPLACE",
  "SERVICES",
  "PROPERTY",
  "VEHICLE",
  "DIRECTORY",
] as const;
export type Module = (typeof MODULES)[number];

export const OPERATOR_TYPES = [
  "MOBILE",
  "DTH",
  "FASTAG",
  "ELECTRICITY",
  "LOAN",
  "CREDIT_CARD",
] as const;
export type OperatorType = (typeof OPERATOR_TYPES)[number];

export const TRANSACTION_TYPES = [...OPERATOR_TYPES, "ECHALLAN"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_STATUSES = ["PENDING", "SUCCESS", "FAILED"] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const LISTING_TYPES = ["PRODUCT", "PROPERTY", "VEHICLE"] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const LISTING_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "INACTIVE",
  "UNDER_REVIEW",
] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const CONDITIONS = ["NEW", "USED", "REFURBISHED"] as const;
export type Condition = (typeof CONDITIONS)[number];

export const REQUEST_STATUSES = [
  "NEW",
  "CONTACTED",
  "COMPLETED",
  "CANCELLED",
] as const;

export const REPORT_STATUSES = ["OPEN", "REVIEWED", "ACTIONED"] as const;

export const MODULE_META: Record<
  Module,
  { label: string; href: string; icon: string; color: string }
> = {
  RECHARGE: {
    label: "Recharge & Bills",
    href: "/recharge",
    icon: "⚡",
    color: "bg-amber-100 text-amber-700",
  },
  MARKETPLACE: {
    label: "Marketplace",
    href: "/marketplace",
    icon: "🛍",
    color: "bg-pink-100 text-pink-700",
  },
  SERVICES: {
    label: "Home Services",
    href: "/services",
    icon: "🔧",
    color: "bg-emerald-100 text-emerald-700",
  },
  PROPERTY: {
    label: "Property",
    href: "/property",
    icon: "🏠",
    color: "bg-indigo-100 text-indigo-700",
  },
  VEHICLE: {
    label: "Vehicles",
    href: "/vehicles",
    icon: "🚗",
    color: "bg-sky-100 text-sky-700",
  },
  DIRECTORY: {
    label: "Find Here",
    href: "/find-here",
    icon: "📍",
    color: "bg-rose-100 text-rose-700",
  },
};
