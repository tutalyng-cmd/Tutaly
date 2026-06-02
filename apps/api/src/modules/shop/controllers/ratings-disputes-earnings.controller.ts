import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request as NestRequest,
  BadRequestException,
} from '@nestjs/common';
import { RatingsDisputesEarningsService } from '../services/ratings-disputes-earnings.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';
import {
  RateProductDto,
  CreateDisputeDto,
  ResolveDisputeDto,
} from '../dto/ratings-disputes-earnings.dto';

interface AuthenticatedRequest {
  user: { sub: string; email: string; role: string };
}

@Controller('shop')
export class RatingsDisputesEarningsController {
  constructor(private readonly ratingsService: RatingsDisputesEarningsService) {}

  // ─── PRODUCT RATINGS ─────────────────────────────────────────

  @Post('products/:id/rate')
  @UseGuards(JwtAuthGuard)
  async rateProduct(
    @Param('id') productId: string,
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: RateProductDto,
  ) {
    return this.ratingsService.rateProduct(productId, req.user.sub, dto);
  }

  @Get('products/:id/ratings')
  async getProductRatings(
    @Param('id') productId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ratingsService.getProductRatings(
      productId,
      parseInt(page || '1', 10),
      parseInt(limit || '10', 10),
    );
  }

  // ─── ORDER DISPUTES ──────────────────────────────────────────

  @Post('orders/:id/dispute')
  @UseGuards(JwtAuthGuard)
  async createDispute(
    @Param('id') orderId: string,
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: CreateDisputeDto,
  ) {
    return this.ratingsService.createDispute(orderId, req.user.sub, dto);
  }

  @Get('admin/disputes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getDisputesForAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.ratingsService.getDisputesForAdmin(
      parseInt(page || '1', 10),
      parseInt(limit || '10', 10),
      status as any,
    );
  }

  @Patch('admin/disputes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async resolveDispute(
    @Param('id') disputeId: string,
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.ratingsService.resolveDispute(disputeId, req.user.sub, dto);
  }

  // ─── SELLER EARNINGS DASHBOARD ───────────────────────────────

  @Get('my-sales')
  @UseGuards(JwtAuthGuard)
  async getSellerSales(
    @NestRequest() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ratingsService.getSellerSales(
      req.user.sub,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Get('my-earnings/summary')
  @UseGuards(JwtAuthGuard)
  async getSellerEarningsSummary(
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.ratingsService.getSellerEarningsSummary(req.user.sub);
  }

  // ─── PHYSICAL PRODUCT CONTACT ───────────────────────────────

  @Get('orders/:id/contact')
  @UseGuards(JwtAuthGuard)
  async getOrderContact(
    @Param('id') orderId: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.ratingsService.getOrderContact(orderId, req.user.sub);
  }

  // ─── ADMIN REVENUE REPORTING ────────────────────────────────

  @Get('admin/revenue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminRevenueReport(
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
  ) {
    const startDate = startDateStr ? new Date(startDateStr) : new Date('2026-01-01');
    const endDate = endDateStr ? new Date(endDateStr) : new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.ratingsService.getAdminRevenueReport(startDate, endDate);
  }
}
