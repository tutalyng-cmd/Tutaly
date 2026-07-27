import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

// ─── Physical Order Tracking DTOs ────────────────────────────────

export class MarkDeliveredDto {
  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  @IsOptional()
  courierName?: string;
}

export class ConfirmReceiptDto {
  @IsString()
  @IsOptional()
  notes?: string;
}

export class OrderStatusDto {
  id: string;
  status: string;
  quantity: number;
  deliveredAt?: Date;
  confirmedAt?: Date;
  escrowReleaseAt?: Date;
  productTitle: string;
  productImage?: string;
  buyerName?: string;
  sellerName?: string;
}

// ─── Featured Listing DTOs ──────────────────────────────────────

export class FeatureListingDto {
  @IsNumber()
  @Min(1)
  durationDays: number; // 7, 30, 90

  @IsString()
  @IsOptional()
  paymentGateway?: 'flutterwave' | 'paystack';
}

export class FeatureListingResponseDto {
  productId: string;
  featuredUntil: Date;
  price: number;
  currency: string;
  durationDays: number;
}

// ─── Product Preview DTOs ───────────────────────────────────────

export class ProductPreviewDto {
  id: string;
  title: string;
  thumbnail?: string;
  price?: number;
  currency: string;
  rating: number;
  ratingCount: number;
  sellerName: string;
  sellerUsername: string;
  isFeatured: boolean;
}

export class ProductDetailDto {
  id: string;
  title: string;
  description: string;
  price?: number;
  currency: string;
  minQuantity: number;
  images: string[];
  pricingType: string;
  listingType: string;
  seller: {
    id: string;
    email: string;
    name: string;
    username: string;
    avatar?: string;
    rating: number;
    totalOrders: number;
  };
  rating: number;
  totalRatings: number;
  ratingDistribution: Record<number, number>;
  isFeatured: boolean;
  featuredUntil?: Date;
  category: string;
  subcategory: string;
}

// ─── Search & Browse DTOs ───────────────────────────────────────

export class ProductSearchDto {
  items: ProductPreviewDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class SearchQueryDto {
  q?: string; // Full-text search query
  category?: string;
  subcategory?: string;
  listingType?: string; // digital, physical, service
  pricingType?: string; // per_unit, request_quote
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string; // featured, recent, popular, price_low, price_high, rating
  page?: number;
  limit?: number;
}

// ─── Quantity & Bulk Order DTOs ─────────────────────────────────

export class CartItemDto {
  productId: string;
  quantity: number;
  price?: number;
}

export class CheckoutDto {
  items: CartItemDto[];
  paymentGateway: 'flutterwave' | 'paystack';
  currency: 'NGN' | 'USD' | 'EUR';
}

// ─── Work-Related Enforcement DTOs ──────────────────────────────

export class WorkRelatedCheckDto {
  listingId: string;
  confirmed: boolean; // Seller confirms this is work-related
}

export class AdminListingModerationDto {
  action: 'approve' | 'reject' | 'remove';
  reason?: string;
  notes?: string;
}
