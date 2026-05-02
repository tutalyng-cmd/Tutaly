import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { EscrowProcessor } from './escrow.processor';
import { SellerGuard } from './guards/seller.guard';
import { ShopProduct, ShopCategory, ShopSubcategory } from './entities/shop.entity';
import { Order, QuoteRequest, OrderDispute } from './entities/order.entity';
import { User } from '../user/entities/user.entity';
import { SellerApplication } from '../support/entities/support.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShopProduct,
      ShopCategory,
      ShopSubcategory,
      Order,
      QuoteRequest,
      OrderDispute,
      User,
      SellerApplication,
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
  ],
  controllers: [ShopController],
  providers: [ShopService, EscrowProcessor, SellerGuard],
  exports: [ShopService],
})
export class ShopModule {}
