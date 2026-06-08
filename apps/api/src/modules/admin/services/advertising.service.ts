import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Ad, AdType } from '../../support/entities/support.entity';

function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export class CreateAdDto {
  type: AdType;
  imageUrl: string;
  targetUrl?: string;
  placement: string;
  startsAt: string; // ISO date string
  endsAt: string;
}

export class UpdateAdDto {
  type?: AdType;
  imageUrl?: string;
  targetUrl?: string;
  placement?: string;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
}

@Injectable()
export class AdvertisingService {
  private readonly logger = new Logger(AdvertisingService.name);

  constructor(
    @InjectRepository(Ad)
    private readonly adRepo: Repository<Ad>,
  ) {}

  /**
   * GET /admin/ads
   */
  async getAds(page = 1, limit = 20, status?: string) {
    const qb = this.adRepo.createQueryBuilder('ad')
      .leftJoinAndSelect('ad.advertiser', 'advertiser')
      .orderBy('ad.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status === 'active') {
      qb.andWhere('ad.isActive = :isActive', { isActive: true })
        .andWhere('ad.endsAt > NOW()');
    } else if (status === 'expired') {
      qb.andWhere('ad.endsAt <= NOW()');
    } else if (status === 'paused') {
      qb.andWhere('ad.isActive = :isActive', { isActive: false })
        .andWhere('ad.endsAt > NOW()');
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      items: toPlain(items),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * POST /admin/ads
   */
  async createAd(dto: CreateAdDto, adminId: string) {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);

    if (endsAt <= startsAt) {
      throw new BadRequestException('endsAt must be after startsAt');
    }

    const ad = this.adRepo.create({
      type: dto.type,
      imageUrl: dto.imageUrl,
      targetUrl: dto.targetUrl || '',
      placement: dto.placement,
      startsAt,
      endsAt,
      isActive: true,
      advertiser: { id: adminId } as any,
    });

    await this.adRepo.save(ad);
    this.logger.log(`Ad created: ${ad.id} by admin ${adminId}`);

    return { success: true, data: toPlain(ad) };
  }

  /**
   * PATCH /admin/ads/:id
   */
  async updateAd(adId: string, dto: UpdateAdDto) {
    const ad = await this.adRepo.findOne({ where: { id: adId } });
    if (!ad) throw new NotFoundException('Ad not found');

    if (dto.type !== undefined) ad.type = dto.type;
    if (dto.imageUrl !== undefined) ad.imageUrl = dto.imageUrl;
    if (dto.targetUrl !== undefined) ad.targetUrl = dto.targetUrl;
    if (dto.placement !== undefined) ad.placement = dto.placement;
    if (dto.startsAt !== undefined) ad.startsAt = new Date(dto.startsAt);
    if (dto.endsAt !== undefined) ad.endsAt = new Date(dto.endsAt);
    if (dto.isActive !== undefined) ad.isActive = dto.isActive;

    await this.adRepo.save(ad);
    return { success: true, data: toPlain(ad) };
  }

  /**
   * DELETE /admin/ads/:id
   */
  async deleteAd(adId: string) {
    const ad = await this.adRepo.findOne({ where: { id: adId } });
    if (!ad) throw new NotFoundException('Ad not found');

    await this.adRepo.remove(ad);
    return { success: true, message: 'Ad deleted' };
  }

  /**
   * GET /ads/active?placement=X
   * Public endpoint returning currently active ads filtered by placement.
   */
  async getActiveAdsByPlacement(placement?: string) {
    const qb = this.adRepo.createQueryBuilder('ad')
      .where('ad.isActive = :isActive', { isActive: true })
      .andWhere('ad.startsAt <= NOW()')
      .andWhere('ad.endsAt > NOW()');

    if (placement) {
      qb.andWhere('ad.placement = :placement', { placement });
    }

    const ads = await qb.orderBy('ad.createdAt', 'DESC').getMany();
    return { data: toPlain(ads) };
  }

  /**
   * Called by cron job daily — expires stale ads.
   */
  async expireStaleAds() {
    const result = await this.adRepo
      .createQueryBuilder()
      .update(Ad)
      .set({ isActive: false })
      .where('isActive = :active', { active: true })
      .andWhere('endsAt <= NOW()')
      .execute();

    const affected = result.affected || 0;
    if (affected > 0) {
      this.logger.log(`Ad expiry cron: ${affected} ad(s) deactivated`);
    }
    return affected;
  }
}
