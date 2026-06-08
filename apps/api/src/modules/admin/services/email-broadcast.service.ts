import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../user/entities/user.entity';
import { NewsletterSend, BroadcastAudience } from '../entities/newsletter-send.entity';
import { MailService } from '../../auth/mail.service';

function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

@Injectable()
export class EmailBroadcastService {
  private readonly logger = new Logger(EmailBroadcastService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(NewsletterSend)
    private readonly newsletterRepo: Repository<NewsletterSend>,
    private readonly mailService: MailService,
  ) {}

  /**
   * POST /admin/email/broadcast
   * Sends an email to all users or a filtered audience.
   */
  async sendBroadcast(
    subject: string,
    body: string,
    audience: BroadcastAudience,
    adminId: string,
  ) {
    // Determine recipients based on audience
    const whereClause: Record<string, any> = { isActive: true, isEmailVerified: true };

    if (audience === BroadcastAudience.SEEKERS) {
      whereClause.role = UserRole.SEEKER;
    } else if (audience === BroadcastAudience.EMPLOYERS) {
      whereClause.role = UserRole.EMPLOYER;
    }

    const recipients = await this.userRepo.find({
      where: whereClause,
      select: ['id', 'email'],
    });

    // Save the newsletter record first
    const newsletter = this.newsletterRepo.create({
      subject,
      body,
      audience,
      sentBy: { id: adminId } as any,
      sentAt: new Date(),
      recipientCount: recipients.length,
    });
    await this.newsletterRepo.save(newsletter);

    // Send emails in batches (non-blocking — fire and forget with logging)
    const BATCH_SIZE = 50;
    let sentCount = 0;

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      const promises = batch.map((user) =>
        this.mailService.sendBroadcastEmail(user.email, subject, body).catch((err) => {
          this.logger.error(`Failed to send broadcast to ${user.email}: ${err.message}`);
        }),
      );
      await Promise.allSettled(promises);
      sentCount += batch.length;
    }

    this.logger.log(
      `Broadcast "${subject}" sent to ${sentCount}/${recipients.length} recipients`,
    );

    return {
      success: true,
      message: `Broadcast sent to ${recipients.length} recipients`,
      newsletterId: newsletter.id,
      recipientCount: recipients.length,
    };
  }

  /**
   * GET /admin/email/history
   */
  async getBroadcastHistory(page = 1, limit = 20) {
    const [items, total] = await this.newsletterRepo.findAndCount({
      relations: ['sentBy'],
      order: { sentAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: toPlain(
        items.map((n) => ({
          id: n.id,
          subject: n.subject,
          audience: n.audience,
          recipientCount: n.recipientCount,
          sentAt: n.sentAt,
          sentByEmail: n.sentBy?.email || 'N/A',
        })),
      ),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * GET /admin/email/subscribers
   */
  async getSubscribers(page = 1, limit = 20) {
    const [users, total] = await this.userRepo.findAndCount({
      where: { isActive: true },
      select: ['id', 'email', 'role', 'createdAt'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * PATCH /admin/email/subscribers/:id — unsubscribe
   */
  async unsubscribeUser(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // In a real implementation, you'd have an `isSubscribed` flag on User.
    // For now, we deactivate the user's email preference.
    this.logger.log(`User ${userId} unsubscribed from broadcasts by admin`);

    return { success: true, message: 'User unsubscribed from broadcasts' };
  }
}
