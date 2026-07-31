import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyReview, ReviewStatus } from './entities/review.entity';
import { ReviewResponse } from './entities/review-response.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { CompanyService } from '../company/company.service';
import * as crypto from 'crypto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(CompanyReview)
    private readonly reviewRepo: Repository<CompanyReview>,
    @InjectRepository(ReviewResponse)
    private readonly responseRepo: Repository<ReviewResponse>,
    private readonly companyService: CompanyService,
  ) {}

  async create(
    dto: CreateReviewDto,
    clientIp: string,
    userAgent: string,
    user: Record<string, any> | null = null,
  ) {
    const hashInput = `${clientIp}-${userAgent}-${new Date().toDateString()}`;
    const submitterHash = crypto
      .createHash('sha256')
      .update(hashInput)
      .digest('hex');

    const recentReview = await this.reviewRepo.findOne({
      where: { submitterHash, company_id: dto.company_id },
      order: { createdAt: 'DESC' },
    });

    if (recentReview) {
      const hoursSince =
        (Date.now() - recentReview.createdAt.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        throw new BadRequestException(
          'You can only submit one review per company per day.',
        );
      }
    }

    const reviewData: Partial<CompanyReview> = {
      ...dto,
      submitterHash,
      status: ReviewStatus.APPROVED,
    };
    if (user) {
      reviewData.user = { id: user.sub } as any;
    }

    const review = this.reviewRepo.create(reviewData);

    await this.reviewRepo.save(review);

    // Automatically recalculate the company's stats since the review is approved instantly
    if (review.company_id) {
      await this.companyService.recalculateAggregates(review.company_id);
    }

    return { success: true, message: 'Review submitted successfully.' };
  }

  async getApprovedReviewsByCompany(companyId: string, page = 1, limit = 10) {
    const [data, total] = await this.reviewRepo.findAndCount({
      where: { company_id: companyId, status: ReviewStatus.APPROVED },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { data, meta: { page, limit, total } };
  }

  async getRecentGlobalReviews(page = 1, limit = 10) {
    const [data, total] = await this.reviewRepo.findAndCount({
      where: { status: ReviewStatus.APPROVED },
      relations: ['company'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { data, meta: { page, limit, total } };
  }

  async getPendingReviews(page = 1, limit = 10) {
    const [data, total] = await this.reviewRepo.findAndCount({
      where: { status: ReviewStatus.PENDING },
      relations: ['company'],
      order: { createdAt: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { data, meta: { page, limit, total } };
  }

  async updateReviewStatus(id: string, status: ReviewStatus) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    review.status = status;
    await this.reviewRepo.save(review);

    if (status === ReviewStatus.APPROVED && review.company_id) {
      await this.companyService.recalculateAggregates(review.company_id);
    }

    return { success: true, message: `Review status updated to ${status}` };
  }

  async addEmployerResponse(
    reviewId: string,
    employerId: string,
    responseText: string,
  ) {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const response = this.responseRepo.create({
      review_id: reviewId,
      employer_user_id: employerId,
      responseText,
    });

    await this.responseRepo.save(response);
    return { success: true, message: 'Response added successfully' };
  }
}
