import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdCampaign } from './entities/ad-campaign.entity';
import { AdImpression } from './entities/ad-impression.entity';
import { AdClick } from './entities/ad-click.entity';
import { BullModule, InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { AdminModule } from '../admin/admin.module';
import { ShopModule } from '../shop/shop.module';
import { AuthModule } from '../auth/auth.module';
import { AdsService } from './services/ads.service';
import { AdsCronProcessor } from './services/ads-cron.processor';
import { AdsController } from './controllers/ads.controller';
import { AdsTrackingController } from './controllers/ads-tracking.controller';
import { AdsAdminController } from './controllers/ads-admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdCampaign, AdImpression, AdClick]),
    BullModule.registerQueue({ name: 'ads-cron' }),
    AdminModule,
    ShopModule,
    AuthModule,
  ],
  controllers: [AdsController, AdsTrackingController, AdsAdminController],
  providers: [AdsService, AdsCronProcessor],
  exports: [AdsService],
})
export class AdsModule implements OnModuleInit {
  constructor(@InjectQueue('ads-cron') private readonly adsQueue: Queue) {}

  async onModuleInit() {
    await this.adsQueue.add(
      'check-ad-budgets',
      {},
      { repeat: { cron: '0 * * * *' } },
    );
    await this.adsQueue.add(
      'weekly-ad-report',
      {},
      { repeat: { cron: '0 7 * * 1' } }, // Monday 8am WAT (7am UTC)
    );
  }
}
