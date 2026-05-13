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
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { SellerApplicationStatus } from '../support/entities/support.entity';
import { Request as NestRequest } from '@nestjs/common';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { DisputeStatus } from '../shop/entities/order.entity';

interface AuthenticatedRequest {
  user: { sub: string; email: string; role: string };
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getUsers(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Patch('users/:id/status')
  async updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isActive') isActive: boolean,
  ) {
    if (typeof isActive !== 'boolean') {
      throw new BadRequestException('isActive must be a boolean');
    }
    return this.adminService.updateUserStatus(id, isActive);
  }

  @Get('jobs/pending')
  async getPendingJobs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getPendingJobs(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Get('jobs')
  async getAllJobs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllJobs(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
      status,
    );
  }

  @Get('sellers')
  async getAllSellerApplications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllSellerApplications(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
      status,
    );
  }

  @Patch('sellers/:id/status')
  async updateSellerStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: SellerApplicationStatus,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.adminService.updateSellerApplication(id, status, req.user.sub);
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

  // ─── Verify Payment (for stuck pending_payment orders) ──────────
  @Post('orders/:id/verify-payment')
  async verifyPayment(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.verifyPaymentWithGateway(id);
  }

  // ─── Cancel Order ───────────────────────────────────────────────
  @Patch('orders/:id/cancel')
  async cancelOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('adminNotes') adminNotes?: string,
  ) {
    return this.adminService.cancelOrder(id, adminNotes);
  }

  // ─── Flag Order ─────────────────────────────────────────────────
  @Patch('orders/:id/flag')
  async flagOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('adminNotes') adminNotes?: string,
  ) {
    return this.adminService.flagOrder(id, adminNotes);
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

  // ─── Disputes ──────────────────────────────────────────────────────────

  @Get('disputes')
  async getDisputes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getDisputes(
      parseInt(page || '1', 10),
      parseInt(limit || '10', 10),
      status as DisputeStatus,
    );
  }

  @Patch('disputes/:id/resolve')
  async resolveDispute(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.adminService.resolveDispute(id, req.user.sub, dto);
  }

  // ─── Review Moderation ──────────────────────────────────────────────────

  @Get('reviews/pending')
  async getPendingReviews(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getPendingReviews(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Patch('reviews/:id/approve')
  async approveReview(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.approveReview(id);
  }

  @Patch('reviews/:id/reject')
  async rejectReview(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.rejectReview(id);
  }
}
