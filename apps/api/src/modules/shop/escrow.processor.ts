import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ShopService } from './shop.service';

@Injectable()
export class EscrowProcessor {
  private readonly logger = new Logger(EscrowProcessor.name);

  constructor(private readonly shopService: ShopService) {}

  // Runs every hour to check for orders that should be auto-released
  @Cron(CronExpression.EVERY_HOUR)
  async handleAutoRelease() {
    this.logger.log('Running escrow auto-release check...');
    try {
      const result = await this.shopService.autoReleaseExpiredEscrows();
      if (result.released > 0) {
        this.logger.log(`Auto-released ${result.released} escrow orders.`);
      }
    } catch (error) {
      this.logger.error('Escrow auto-release failed:', error);
    }
  }
}
