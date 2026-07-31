import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  UseGuards,
  Request as NestRequest,
  Ip,
  Headers,
  Patch,
} from '@nestjs/common';
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
    let user = null;
    if (req.headers.authorization) {
      user = req.user;
    }
    return this.reviewService.create(
      dto,
      ip || 'unknown-ip',
      userAgent || 'unknown-ua',
      user,
    );
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

  @Post('employer/:id/response')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  async addEmployerResponse(
    @Param('id') reviewId: string,
    @Body('responseText') responseText: string,
    @NestRequest() req: any,
  ) {
    return this.reviewService.addEmployerResponse(
      reviewId,
      req.user.sub,
      responseText,
    );
  }

  @Get('all/recent')
  async getRecentGlobalReviews(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = parseInt(page || '1', 10);
    const l = parseInt(limit || '10', 10);
    return this.reviewService.getRecentGlobalReviews(p, l);
  }

  @Get('by-company/:companyId')
  async getReviewsByCompany(
    @Param('companyId') companyId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = parseInt(page || '1', 10);
    const l = parseInt(limit || '10', 10);
    return this.reviewService.getApprovedReviewsByCompany(companyId, p, l);
  }
}
