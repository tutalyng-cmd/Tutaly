import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdvertisingService } from '../services/advertising.service';

@Injectable()
export class AdExpiryCron {
  private readonly logger = new Logger(AdExpiryCron.name);

  constructor(private readonly advertisingService: AdvertisingService) {}

  /**
   * Runs daily at midnight — deactivates ads whose endsAt has passed.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleAdExpiry() {
    this.logger.debug('Running ad expiry cron job...');
    const expired = await this.advertisingService.expireStaleAds();
    if (expired > 0) {
      this.logger.log(`Ad expiry cron completed: ${expired} ad(s) expired`);
    }
  }
}
