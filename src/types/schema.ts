import { Timestamp } from 'firebase/firestore';

export type OutfitStatus = 'draft' | 'published' | 'archived';
export type MediaType = 'image' | 'video';

export interface Outfit {
  id: string; // Business identifier, e.g. "OUT-001"
  slug: string; // URL-safe identifier, e.g. "mumbai-streetwear-linen"
  title: string;
  description: string;
  category: string;
  tags: string[];
  heroImageUrl?: string; // Legacy direct image URL
  heroMediaType?: MediaType; // 'image' | 'video'
  heroMediaUrl?: string; // Primary image or video URL
  heroThumbnailUrl?: string | null; // Poster / thumbnail image URL
  heroMediaAlt?: string | null;
  status: OutfitStatus;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  publishedAt?: Timestamp | string | null;
}

export interface Product {
  id?: string;
  outfitId: string; // References Outfit document ID or business identifier
  name: string;
  retailer: string;
  category?: string; // Optional clothing category (e.g., 'Shirt', 'Pants', 'Shoes', 'Accessory')
  retailerLogoUrl?: string | null; // Optional direct retailer logo URL
  price?: number | null;
  currency: string; // "INR" default
  affiliateUrl: string;
  imageUrl?: string | null;
  sortOrder: number;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface ClickEvent {
  id?: string;
  outfitId: string;
  productId: string;
  retailer: string;
  clickedAt: Timestamp | string;
}

export type AdminRole = 'super_admin' | 'editor';

export interface AdminUser {
  uid: string;
  email: string;
  role: AdminRole;
  createdAt: Timestamp | string;
}

export type CategoryGroup = 'Everyday' | 'Occasions' | 'Seasonal' | 'Style' | 'Custom';

export interface Category {
  id: string; // URL-safe or slug, e.g. "streetwear", "diwali-2026"
  name: string; // e.g. "Diwali 2026"
  group?: CategoryGroup;
  description?: string;
  tagline?: string;
  accent?: string;
  imageUrl?: string | null;
  isCustom?: boolean;
  archived?: boolean;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}
