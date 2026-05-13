import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/support.entity';

function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(Notification) private readonly notificationRepo: Repository<Notification>,
  ) {}

  // ─── Notifications ──────────────────────────────────────────────────

  async createNotification(userId: string, type: string, message: string, link?: string) {
    const notification = this.notificationRepo.create({
      user: { id: userId } as any,
      type,
      message,
      link,
    });
    return this.notificationRepo.save(notification);
  }

  async getNotifications(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.notificationRepo.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    const unreadCount = await this.notificationRepo.count({
      where: { user: { id: userId }, isRead: false },
    });

    return { data: toPlain(data), meta: { page, limit, total, unreadCount } };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId, user: { id: userId } },
    });
    if (!notification) throw new NotFoundException('Notification not found');

    notification.isRead = true;
    await this.notificationRepo.save(notification);
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );
    return { success: true };
  }
}
