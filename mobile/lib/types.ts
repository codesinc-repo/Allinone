export type Role = "USER" | "ADMIN";

export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  role: Role;
};

export type Operator = {
  id: string;
  name: string;
  code: string;
  type: "MOBILE" | "DTH" | "FASTAG" | "ELECTRICITY" | "LOAN" | "CREDIT_CARD";
  icon: string;
};

export type Category = { id: string; slug: string; name: string; icon: string };
export type CategoryModule = "MARKETPLACE" | "SERVICES" | "DIRECTORY";

export type Listing = {
  id: string;
  type: "PRODUCT" | "PROPERTY" | "VEHICLE";
  subtype?: string;
  title: string;
  description: string;
  price: number;
  condition?: "NEW" | "USED" | "REFURBISHED";
  categoryId?: string;
  sellerId: string;
  images: string[];
  location: string;
  meta?: Record<string, any>;
  createdAt: string;
  status?: "ACTIVE" | "INACTIVE" | "DRAFT";
};

export type ServiceProvider = {
  id: string;
  name: string;
  categoryId: string;
  bio: string;
  phone: string;
  serviceArea: string;
  availability: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  avatar: string;
};

export type DirectoryEntry = {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  address: string;
  phone?: string;
  website?: string;
  hours?: string;
  isPaid: boolean;
  featured: boolean;
};

export type Transaction = {
  id: string;
  userId: string;
  operatorId?: string;
  type: Operator["type"] | "ECHALLAN";
  amount: number;
  reference: string;
  status: "SUCCESS" | "PENDING" | "FAILED";
  providerRef: string;
  message: string;
  createdAt: string;
};

export type Inquiry = {
  id: string;
  listingId: string;
  buyerId: string;
  message: string;
  contact: string;
  createdAt: string;
};

export type ServiceRequest = {
  id: string;
  providerId: string;
  userId: string;
  description: string;
  location: string;
  preferredTime: string;
  status: "NEW" | "CONTACTED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
};

export type Review = {
  id: string;
  providerId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
};
