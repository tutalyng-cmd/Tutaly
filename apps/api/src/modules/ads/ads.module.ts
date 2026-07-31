import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdCampaign } from './entities/ad-campaign.entity';
import { AdImpression } from './entities/ad-impression.entity';
import { AdClick } from './entities/ad-click.entity';
import { AdminModule } from '../admin/admin.module';
import { ShopModule } from '../shop/shop.module';
import { AuthModule } from '../auth/auth.module';
import { AdsService } from './services/ads.service';
import { AdsCronService } from './services/ads-cron.service';
import { AdsController } from './controllers/ads.controller';
import { AdsTrackingController } from './controllers/ads-tracking.controller';
import { AdsAdminController } from './controllers/ads-admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdCampaign, AdImpression, AdClick]),
    AdminModule,
    ShopModule,
    AuthModule,
  ],
  controllers: [AdsController, AdsTrackingController, AdsAdminController],
  providers: [AdsService, AdsCronService],
  exports: [AdsService],
})
export class AdsModule {}
