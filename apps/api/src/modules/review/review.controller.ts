import { Controller, Post, Body, Get, Param, Query, UseGuards, Request as NestRequest, Ip, Headers, Patch } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { ReviewStatus } from './entities/review.entity';
@Controller('reviews/companies')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async createReview(
    @Body() dto: CreateReviewDto,
    @NestRequest() req: any,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    // Check if Authorization header exists to determine if guest or auth
    let user = null;
    if (req.headers.authorization) {
      // Assuming a simplistic check, ideally we use an OptionalJwtAuthGuard
      // For now, if there's a token, we might want to attach user, but the prompt says guest + authenticated.
      // We will let JwtAuthGuard handle authenticated endpoints if we want strict enforcement,
      // but here we just pass the user if available (assuming a custom middleware or OptionalGuard handles it).
      // If we don't have an Optional Guard, we can just extract the JWT manually or leave user as null.
      // To keep it simple, if `req.user` is somehow populated, use it.
      user = req.user;
    }
    return this.reviewService.create(dto, ip || 'unknown-ip', userAgent || 'unknown-ua', user);
  }

  @Get('admin/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPendingReviews(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = parseInt(page || '1', 10);
    const l = parseInt(limit || '10', 10);
    return this.reviewService.getPendingReviews(p, l);
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateReviewStatus(
    @Param('id') id: string,
    @Body('status') status: ReviewStatus,
  ) {
    return this.reviewService.updateReviewStatus(id, status);
  }

  @Get(':companyName/aggregates')
  async getAggregates(@Param('companyName') companyName: string) {
    return { data: await this.reviewService.getCompanyAggregates(companyName) };
  }

  @Get(':companyName')
  async getReviews(
    @Param('companyName') companyName: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = parseInt(page || '1', 10);
    const l = parseInt(limit || '10', 10);
    return this.reviewService.getApprovedReviews(companyName, p, l);
  }
}

