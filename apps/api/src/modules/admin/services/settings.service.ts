import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '../entities/platform-setting.entity';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingsRepo: Repository<PlatformSetting>,
  ) {}

  /**
   * Commission Rate Management
   */
  async getCommissionRate(): Promise<number> {
    const setting = await this.settingsRepo.findOne({ where: { key: 'commission_rate' } });
    if (!setting) {
      return 20; // Default 20%
    }
    return (setting.value as any).rate || 20;
  }

  async updateCommissionRate(rate: number, adminId: string) {
    let setting = await this.settingsRepo.findOne({ where: { key: 'commission_rate' } });
    if (!setting) {
      setting = this.settingsRepo.create({ key: 'commission_rate' });
    }
    setting.value = { rate };
    setting.description = 'Platform global commission rate percentage';
    setting.updatedById = adminId;
    await this.settingsRepo.save(setting);
    
    this.logger.log(`Commission rate updated to ${rate}% by admin ${adminId}`);
    return { success: true, data: { rate } };
  }

  /**
   * Cookie Consent Management
   */
  async getCookieSettings() {
    const setting = await this.settingsRepo.findOne({ where: { key: 'cookie_settings' } });
    if (!setting) {
      return {
        categories: [
          { id: 'essential', name: 'Essential', description: 'Required for the site to function.', required: true },
          { id: 'analytics', name: 'Analytics', description: 'Help us improve by tracking usage.', required: false },
          { id: 'marketing', name: 'Marketing', description: 'Used to deliver personalized ads.', required: false },
        ]
      };
    }
    return setting.value;
  }

  async updateCookieSettings(categories: any[], adminId: string) {
    let setting = await this.settingsRepo.findOne({ where: { key: 'cookie_settings' } });
    if (!setting) {
      setting = this.settingsRepo.create({ key: 'cookie_settings' });
    }
    setting.value = { categories };
    setting.description = 'Cookie consent categories and descriptions';
    setting.updatedById = adminId;
    await this.settingsRepo.save(setting);

    this.logger.log(`Cookie settings updated by admin ${adminId}`);
    return { success: true, data: setting.value };
  }
}
