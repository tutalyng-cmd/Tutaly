import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  BadRequestException,
  Request as NestRequest,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { NotificationService } from './services/notification.service';
import { UserManagementService, UserStatus } from './services/user-management.service';
import { JobsModerationService } from './services/jobs-moderation.service';
import { ReviewsModerationService } from './services/reviews-moderation.service';
import { SellersModerationService } from './services/sellers-moderation.service';
import { ReportsModerationService } from './services/reports-moderation.service';
import { DisputesResolutionService, DisputeResolution } from './services/disputes-resolution.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

interface AuthenticatedRequest {
  user: { sub: string; email: string; role: string };
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly userManagementService: UserManagementService,
    private readonly jobsModerationService: JobsModerationService,
    private readonly reviewsModerationService: ReviewsModerationService,
    private readonly sellersModerationService: SellersModerationService,
    private readonly reportsModerationService: ReportsModerationService,
    private readonly disputesResolutionService: DisputesResolutionService,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // DASHBOARD STATS (Old AdminService)
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('stats')
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // USER MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('users')
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.userManagementService.getUsers(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
      search,
      role as any,
      status as UserStatus,
    );
  }

  @Get('users/:id')
  async getUserDetail(@Param('id', ParseUUIDPipe) userId: string) {
    return this.userManagementService.getUserDetail(userId);
  }

  @Patch('users/:id')
  async updateUserStatus(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body('status') status: UserStatus,
  ) {
    await this.userManagementService.updateUserStatus(userId, status);
    return { success: true, message: `User status updated to ${status}` };
  }

  @Post('users/bulk')
  async bulkUpdateUsers(
    @Body('userIds') userIds: string[],
    @Body('status') status: UserStatus,
  ) {
    await this.userManagementService.bulkUpdateUserStatus(userIds, status);
    return { success: true, message: `Bulk action applied to ${userIds.length} users` };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // JOBS MODERATION
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('queue/jobs')
  async getPendingJobs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.jobsModerationService.getPendingJobs(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Patch('jobs/:id')
  async approveOrRemoveJob(
    @Param('id', ParseUUIDPipe) jobId: string,
    @Body('action') action: 'approve' | 'remove',
  ) {
    if (action === 'approve') {
      await this.jobsModerationService.approveJob(jobId);
      return { success: true, message: 'Job approved and published' };
    } else if (action === 'remove') {
      await this.jobsModerationService.removeJob(jobId);
      return { success: true, message: 'Job removed' };
    }
  }

  @Get('jobs')
  async getAllJobs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('employerId') employerId?: string,
  ) {
    return this.jobsModerationService.getAllJobs(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
      status as any,
      employerId,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REVIEWS MODERATION
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('queue/reviews')
  async getPendingReviews(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsModerationService.getPendingReviews(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Patch('reviews/:id')
  async approveOrRejectReview(
    @Param('id', ParseUUIDPipe) reviewId: string,
    @Body('action') action: 'approve' | 'reject' | 'edit_approve',
    @Body('pros') pros?: string,
    @Body('cons') cons?: string,
  ) {
    if (action === 'approve') {
      await this.reviewsModerationService.approveReview(reviewId);
      return { success: true, message: 'Review approved and published' };
    } else if (action === 'reject') {
      await this.reviewsModerationService.rejectReview(reviewId);
      return { success: true, message: 'Review rejected' };
    } else if (action === 'edit_approve') {
      await this.reviewsModerationService.editAndApproveReview(reviewId, pros, cons);
      return { success: true, message: 'Review edited and approved' };
    }
  }

  @Get('reviews')
  async getAllReviews(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('companyName') companyName?: string,
  ) {
    return this.reviewsModerationService.getAllReviews(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
      status as any,
      companyName,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELLERS MODERATION
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('queue/sellers')
  async getPendingSellerApplications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.sellersModerationService.getPendingSellerApplications(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Patch('sellers/:id')
  async approveOrRejectSeller(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body('action') action: 'approve' | 'reject',
    @Body('reason') reason?: string,
  ) {
    if (action === 'approve') {
      await this.sellersModerationService.approveSeller(userId);
      return { success: true, message: 'Seller application approved' };
    } else if (action === 'reject') {
      await this.sellersModerationService.rejectSeller(userId, reason);
      return { success: true, message: 'Seller application rejected' };
    }
  }

  @Get('sellers')
  async getActiveSellerApplications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.sellersModerationService.getActiveSellerApplications(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REPORTS MODERATION
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('queue/reports')
  async getPendingReports(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsModerationService.getPendingReports(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Patch('reports/:id')
  async resolveReport(
    @Param('id', ParseUUIDPipe) reportId: string,
    @Body('action') action: 'remove_content' | 'dismiss',
  ) {
    if (action === 'remove_content') {
      await this.reportsModerationService.removeContent(reportId);
      return { success: true, message: 'Content removed' };
    } else if (action === 'dismiss') {
      await this.reportsModerationService.dismissReport(reportId);
      return { success: true, message: 'Report dismissed' };
    }
  }

  @Post('reports/bulk-dismiss')
  async bulkDismissReports(@Body('reportIds') reportIds: string[]) {
    await this.reportsModerationService.bulkDismissReports(reportIds);
    return { success: true, message: `${reportIds.length} reports dismissed` };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DISPUTES RESOLUTION
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('queue/disputes')
  async getOpenDisputes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.disputesResolutionService.getOpenDisputes(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Get('disputes')
  async getAllDisputes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getDisputes(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
      status as any,
    );
  }

  @Patch('disputes/:id')
  async resolveDispute(
    @Param('id', ParseUUIDPipe) disputeId: string,
    @Body('resolution') resolution: DisputeResolution,
    @Body('resolutionNotes') resolutionNotes: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    await this.disputesResolutionService.resolveDispute(
      disputeId,
      resolution,
      resolutionNotes,
      req.user.sub,
    );
    return { success: true, message: 'Dispute resolved' };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('notifications')
  async getUserNotifications(
    @NestRequest() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationService.getUserNotifications(
      req.user.sub,
      parseInt(page || '1', 10),
      parseInt(limit || '10', 10),
    );
  }

  @Patch('notifications/:id/read')
  async markNotificationAsRead(@Param('id', ParseUUIDPipe) notificationId: string) {
    await this.notificationService.markAsRead(notificationId);
    return { success: true };
  }

  @Patch('notifications/read-all')
  async markAllNotificationsAsRead(@NestRequest() req: AuthenticatedRequest) {
    await this.notificationService.markAllAsRead(req.user.sub);
    return { success: true };
  }

  @Get('notifications/unread-count')
  async getUnreadNotificationCount(@NestRequest() req: AuthenticatedRequest) {
    const unreadCount = await this.notificationService.getUnreadCount(req.user.sub);
    return { unreadCount };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LEGACY ENDPOINTS (Old AdminService - kept for compatibility)
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('orders')
  async getAllOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllOrders(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
      status,
    );
  }

  @Get('products')
  async getAllProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.adminService.getAllProducts(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
      isActive === undefined ? undefined : isActive === 'true',
    );
  }

  @Get('orders/flagged')
  async getFlaggedOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getFlaggedOrders(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Patch('orders/:id/resolve')
  async resolveFlaggedOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('resolution') resolution: 'completed' | 'refunded',
    @Body('adminNotes') adminNotes?: string,
  ) {
    if (!['completed', 'refunded'].includes(resolution)) {
      throw new BadRequestException('Resolution must be completed or refunded');
    }
    return this.adminService.resolveFlaggedOrder(id, resolution, adminNotes);
  }

  @Post('orders/:id/verify-payment')
  async verifyPayment(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.verifyPaymentWithGateway(id);
  }

  @Patch('orders/:id/cancel')
  async cancelOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('adminNotes') adminNotes?: string,
  ) {
    return this.adminService.cancelOrder(id, adminNotes);
  }

  @Patch('orders/:id/flag')
  async flagOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('adminNotes') adminNotes?: string,
  ) {
    return this.adminService.flagOrder(id, adminNotes);
  }
}
