import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ShopController } from './shop.controller';
import { RatingsDisputesEarningsController } from './controllers/ratings-disputes-earnings.controller';
import { PhysicalOrdersController } from './controllers/physical-orders.controller';
import { FeaturedListingsController } from './controllers/featured-listings.controller';
import { ProductSearchController } from './controllers/product-search.controller';
import { ShopService } from './shop.service';
import { RatingsDisputesEarningsService } from './services/ratings-disputes-earnings.service';
import { PhysicalOrderService } from './services/physical-order.service';
import { FeaturedListingsService } from './services/featured-listings.service';
import { ProductSearchService } from './services/product-search.service';
import { EscrowProcessor } from './escrow.processor';
import { QuoteProcessor } from './quote.processor';
import { SellerGuard } from './guards/seller.guard';
import {
  ShopProduct,
  ShopCategory,
  ShopSubcategory,
} from './entities/shop.entity';
import { Order, QuoteRequest, OrderDispute } from './entities/order.entity';
import { PaymentTransactionAudit } from './entities/payment-audit.entity';
import { ProductRating } from './entities/product-rating.entity';
import { User } from '../user/entities/user.entity';
import { SeekerProfile } from '../user/entities/seeker-profile.entity';
import { SellerApplication } from '../support/entities/support.entity';
import { AuthModule } from '../auth/auth.module';

// Payment Gateway Services
import { PaymentGatewayFactory } from './gateways/payment-gateway.factory';
import { FlutterwaveGateway } from './gateways/flutterwave.gateway';
import { PaystackGateway } from './gateways/paystack.gateway';
import { StripeGateway } from './gateways/stripe.gateway';

// Shop Services
import { CurrencyConversionService } from './services/currency-conversion.service';
import { PaymentIdempotencyService } from './services/payment-idempotency.service';
import { PaymentAuditService } from './services/payment-audit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShopProduct,
      ShopCategory,
      ShopSubcategory,
      Order,
      QuoteRequest,
      OrderDispute,
      PaymentTransactionAudit,
      ProductRating,
      User,
      SeekerProfile,
      SellerApplication,
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
  ],
  controllers: [
    ShopController,
    RatingsDisputesEarningsController,
    PhysicalOrdersController,
    FeaturedListingsController,
    ProductSearchController,
  ],
  providers: [
    ShopService,
    RatingsDisputesEarningsService,
    PhysicalOrderService,
    FeaturedListingsService,
    ProductSearchService,
    EscrowProcessor,
    QuoteProcessor,
    SellerGuard,
    // Payment Gateway Services
    FlutterwaveGateway,
    PaystackGateway,
    StripeGateway,
    PaymentGatewayFactory,
    // Shop Services
    CurrencyConversionService,
    PaymentIdempotencyService,
    PaymentAuditService,
  ],
  exports: [
    ShopService,
    RatingsDisputesEarningsService,
    PhysicalOrderService,
    FeaturedListingsService,
    ProductSearchService,
    CurrencyConversionService,
    PaymentGatewayFactory,
    PaymentAuditService,
  ],
})
export class ShopModule {}
