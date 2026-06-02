import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ShopController } from './shop.controller';
import { RatingsDisputesEarningsController } from './controllers/ratings-disputes-earnings.controller';
import { ShopService } from './shop.service';
import { RatingsDisputesEarningsService } from './services/ratings-disputes-earnings.service';
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
import { SellerApplication } from '../support/entities/support.entity';
import { AuthModule } from '../auth/auth.module';

// Payment Gateway Services
import { PaymentGatewayFactory } from './gateways/payment-gateway.factory';
import { FlutterwaveGateway } from './gateways/flutterwave.gateway';
import { PaystackGateway } from './gateways/paystack.gateway';

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
      SellerApplication,
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
  ],
  controllers: [ShopController, RatingsDisputesEarningsController],
  providers: [
    ShopService,
    RatingsDisputesEarningsService,
    EscrowProcessor,
    QuoteProcessor,
    SellerGuard,
    // Payment Gateway Services
    FlutterwaveGateway,
    PaystackGateway,
    PaymentGatewayFactory,
    // Shop Services
    CurrencyConversionService,
    PaymentIdempotencyService,
    PaymentAuditService,
  ],
  exports: [
    ShopService,
    RatingsDisputesEarningsService,
    CurrencyConversionService,
    PaymentGatewayFactory,
    PaymentAuditService,
  ],
})
export class ShopModule {}
