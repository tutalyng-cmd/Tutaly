import {
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  IsEnum,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsArray,
} from 'class-validator';

// ─── Order Dispute DTOs ──────────────────────────────────────────

export class CreateDisputeDto {
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  reason: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  evidenceUrls?: string[]; // File URLs from Supabase
}

export class ResolveDisputeDto {
  @IsEnum(['refund', 'release'])
  decision: 'refund' | 'release';

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  resolutionNotes: string;
}

export class DisputeResponseDto {
  id: string;
  orderId: string;
  raisedBy: {
    id: string;
    email: string;
  };
  reason: string;
  status: string;
  resolution?: {
    decision: string;
    notes: string;
    resolvedAt: Date;
    resolvedBy: string;
  };
  createdAt: Date;
}

// ─── Product Rating DTOs ─────────────────────────────────────────

export class RateProductDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number; // 1-5 stars

  @IsString()
  @IsOptional()
  @MaxLength(500)
  comment?: string;
}

export class ProductRatingResponseDto {
  id: string;
  productId: string;
  buyerUsername: string; // Anonymized
  rating: number;
  comment?: string;
  createdAt: Date;
}

export class ProductAggregateRatingDto {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    [key: number]: number; // { 1: 10, 2: 5, 3: 20, 4: 50, 5: 150 }
  };
}

// ─── Seller Earnings DTOs ────────────────────────────────────────

export class SellerSaleDto {
  id: string;
  productTitle: string;
  buyerUsername: string; // Anonymized
  amount: number;
  commissionDeducted: number;
  sellerEarnings: number;
  currency: string;
  status: string;
  completedAt: Date;
}

export class SellerSalesListDto {
  items: SellerSaleDto[];
  total: number;
  page: number;
  limit: number;
}

export class SellerEarningsSummaryDto {
  totalGrossSales: number;
  totalCommissionPaid: number;
  totalNetEarnings: number;
  pendingAmount: number;
  currency: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export class SellerEarningsBreakdownDto {
  orderId: string;
  productTitle: string;
  grossAmount: number;
  commissionPercentage: number; // 20
  commissionAmount: number;
  netAmount: number;
  currency: string;
  status: string;
  completedAt: Date;
}

// ─── Order Contact Reveal DTOs ───────────────────────────────────

export class OrderContactDto {
  sellerName: string;
  sellerUsername: string;
  contactPhone?: string;
  whatsappPhone?: string;
  email: string;
}

// ─── Admin Revenue DTOs ──────────────────────────────────────────

export class AdminRevenueReportDto {
  totalTransactions: number;
  totalGrossVolume: number;
  totalCommissionsEarned: number;
  byGateway: {
    [gateway: string]: {
      volume: number;
      commission: number;
      transactionCount: number;
    };
  };
  byCurrency: {
    [currency: string]: {
      volume: number;
      commission: number;
    };
  };
  period: {
    startDate: Date;
    endDate: Date;
  };
}

// ─── Seller Dashboard DTOs ───────────────────────────────────────

export class SellerListingDto {
  id: string;
  title: string;
  description: string;
  price?: number;
  currency: string;
  listingType: string; // digital, physical, service
  pricingType: string; // per_unit, request_quote
  isActive: boolean;
  createdAt: Date;
  viewCount?: number;
  saleCount?: number;
}

export class SellerOrderDto {
  id: string;
  productTitle: string;
  buyerUsername: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: Date;
  deliveredAt?: Date;
  isDelivered: boolean;
}

export class SellerDashboardSummaryDto {
  totalListings: number;
  activeListings: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalEarnings: number;
  pendingEarnings: number;
  currency: string;
}
