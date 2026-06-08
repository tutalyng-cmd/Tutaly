import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from '../entities/announcement.entity';

function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);

  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
  ) {}

  /**
   * POST /admin/announcements
   */
  async createAnnouncement(
    title: string,
    body: string,
    adminId: string,
    expiresAt?: string,
  ) {
    const announcement = this.announcementRepo.create({
      title,
      body,
      isActive: true,
      createdBy: { id: adminId } as any,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    await this.announcementRepo.save(announcement);
    this.logger.log(`Announcement created: "${title}" by admin ${adminId}`);

    return { success: true, data: toPlain(announcement) };
  }

  /**
   * GET /announcements/active — public endpoint.
   */
  async getActiveAnnouncements() {
    const announcements = await this.announcementRepo
      .createQueryBuilder('a')
      .where('a.isActive = :active', { active: true })
      .andWhere('(a.expiresAt IS NULL OR a.expiresAt > NOW())')
      .orderBy('a.createdAt', 'DESC')
      .getMany();

    return { data: toPlain(announcements) };
  }

  /**
   * GET /admin/announcements — admin: all announcements paginated.
   */
  async getAllAnnouncements(page = 1, limit = 20) {
    const [items, total] = await this.announcementRepo.findAndCount({
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: toPlain(
        items.map((a) => ({
          id: a.id,
          title: a.title,
          body: a.body,
          isActive: a.isActive,
          expiresAt: a.expiresAt,
          createdAt: a.createdAt,
          createdByEmail: a.createdBy?.email || 'N/A',
        })),
      ),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * PATCH /admin/announcements/:id/deactivate
   */
  async deactivateAnnouncement(announcementId: string) {
    const announcement = await this.announcementRepo.findOne({
      where: { id: announcementId },
    });
    if (!announcement) throw new NotFoundException('Announcement not found');

    announcement.isActive = false;
    await this.announcementRepo.save(announcement);

    return { success: true, message: 'Announcement deactivated' };
  }
}
