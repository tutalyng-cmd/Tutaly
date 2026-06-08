import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminController } from './admin.controller';
import { PublicContentController } from './controllers/public-content.controller';
import { AdminService } from './admin.service';
import { NotificationService } from './services/notification.service';
import { UserManagementService } from './services/user-management.service';
import { JobsModerationService } from './services/jobs-moderation.service';
import { ReviewsModerationService } from './services/reviews-moderation.service';
import { SellersModerationService } from './services/sellers-moderation.service';
import { ReportsModerationService } from './services/reports-moderation.service';
import { DisputesResolutionService } from './services/disputes-resolution.service';
import { RevenueService } from './services/revenue.service';
import { AnalyticsService } from './services/analytics.service';
import { AdvertisingService } from './services/advertising.service';
import { EmailBroadcastService } from './services/email-broadcast.service';
import { LegalPagesService } from './services/legal-pages.service';
import { AnnouncementsService } from './services/announcements.service';
import { SettingsService } from './services/settings.service';
import { AdExpiryCron } from './processors/ad-expiry.cron';
import { User } from '../user/entities/user.entity';
import { SeekerProfile } from '../user/entities/seeker-profile.entity';
import { EmployerProfile } from '../user/entities/employer-profile.entity';
import { Job, Application } from '../job/entities/job.entity';
import { Order, OrderDispute } from '../shop/entities/order.entity';
import { SellerApplication, LegalPage, Ad } from '../support/entities/support.entity';
import { ShopProduct } from '../shop/entities/shop.entity';
import { CompanyReview } from '../review/entities/review.entity';
import { Post } from '../connect/entities/post.entity';
import { Report } from '../connect/entities/report.entity';
import { Notification } from './entities/notification.entity';
import { NewsletterSend } from './entities/newsletter-send.entity';
import { Announcement } from './entities/announcement.entity';
import { PlatformSetting } from './entities/platform-setting.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      SeekerProfile,
      EmployerProfile,
      Job,
      Application,
      Order,
      OrderDispute,
      SellerApplication,
      ShopProduct,
      CompanyReview,
      Post,
      Report,
      Notification,
      NewsletterSend,
      Announcement,
      PlatformSetting,
      LegalPage,
      Ad,
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
  ],
  controllers: [AdminController, PublicContentController],
  providers: [
    AdminService,
    NotificationService,
    UserManagementService,
    JobsModerationService,
    ReviewsModerationService,
    SellersModerationService,
    ReportsModerationService,
    DisputesResolutionService,
    RevenueService,
    AnalyticsService,
    AdvertisingService,
    EmailBroadcastService,
    LegalPagesService,
    AnnouncementsService,
    SettingsService,
    AdExpiryCron,
  ],
  exports: [NotificationService],
})
export class AdminModule {}
