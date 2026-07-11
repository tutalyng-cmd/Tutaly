import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyReview, ReviewStatus } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import * as crypto from 'crypto';

export interface ReviewAggregateResult {
  totalReviews: string;
  avgOverall: string;
  avgWorkLife: string;
  avgPay: string;
  avgManagement: string;
  avgCulture: string;
  recommendPercentage: string;
}

export interface ReviewSearchResult {
  companyName: string;
  totalReviews: string;
  avgOverall: string;
}

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(CompanyReview)
    private readonly reviewRepo: Repository<CompanyReview>,
  ) {}

  async create(
    dto: CreateReviewDto,
    clientIp: string,
    userAgent: string,
    user: Record<string, any> | null = null,
  ) {
    // Generate a hash to prevent spam (guest submission tracking)
    const hashInput = `${clientIp}-${userAgent}-${new Date().toDateString()}`;
    const submitterHash = crypto
      .createHash('sha256')
      .update(hashInput)
      .digest('hex');

    // Basic rate limiting: Check if same hash submitted recently
    const recentReview = await this.reviewRepo.findOne({
      where: { submitterHash, companyName: dto.companyName },
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
      status: ReviewStatus.PENDING,
    };
    if (user) {
      reviewData.user = { id: user.sub } as any; // TypeORM relation
    }

    const review = this.reviewRepo.create(reviewData);

    await this.reviewRepo.save(review);
    return { success: true, message: 'Review submitted and pending approval.' };
  }

  async getCompanyAggregates(companyName: string) {
    const stats = await this.reviewRepo
      .createQueryBuilder('review')
      .where('review.companyName = :companyName', { companyName })
      .andWhere('review.status = :status', { status: ReviewStatus.APPROVED })
      .select('COUNT(*)', 'totalReviews')
      .addSelect('AVG(review.ratingOverall)', 'avgOverall')
      .addSelect('AVG(review.ratingWorkLife)', 'avgWorkLife')
      .addSelect('AVG(review.ratingPay)', 'avgPay')
      .addSelect('AVG(review.ratingManagement)', 'avgManagement')
      .addSelect('AVG(review.ratingCulture)', 'avgCulture')
      .addSelect(
        'SUM(CASE WHEN review.recommend = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*)',
        'recommendPercentage',
      )
      .getRawOne();

    const typedStats: ReviewAggregateResult | undefined = stats;

    if (!typedStats || typedStats.totalReviews === '0') {
      return null;
    }

    return {
      totalReviews: parseInt(typedStats.totalReviews),
      avgOverall: parseFloat(typedStats.avgOverall).toFixed(1),
      avgWorkLife: parseFloat(typedStats.avgWorkLife || '0').toFixed(1),
      avgPay: parseFloat(typedStats.avgPay || '0').toFixed(1),
      avgManagement: parseFloat(typedStats.avgManagement || '0').toFixed(1),
      avgCulture: parseFloat(typedStats.avgCulture || '0').toFixed(1),
      recommendPercentage: parseFloat(
        typedStats.recommendPercentage || '0',
      ).toFixed(0),
    };
  }

  async getApprovedReviews(companyName: string, page = 1, limit = 10) {
    const [data, total] = await this.reviewRepo.findAndCount({
      where: { companyName, status: ReviewStatus.APPROVED },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { data, meta: { page, limit, total } };
  }

  async getRecentGlobalReviews(page = 1, limit = 10) {
    const [data, total] = await this.reviewRepo.findAndCount({
      where: { status: ReviewStatus.APPROVED },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { data, meta: { page, limit, total } };
  }

  async searchCompanies(query: string) {
    if (!query) return [];

    // Group by companyName, match by ilike
    const stats = await this.reviewRepo
      .createQueryBuilder('review')
      .select('review.companyName', 'companyName')
      .addSelect('COUNT(*)', 'totalReviews')
      .addSelect('AVG(review.ratingOverall)', 'avgOverall')
      .where('review.status = :status', { status: ReviewStatus.APPROVED })
      .andWhere('review.companyName ILIKE :query', { query: `%${query}%` })
      .groupBy('review.companyName')
      .orderBy('"totalReviews"', 'DESC')
      .limit(10)
      .getRawMany();

    const typedStats: ReviewSearchResult[] = stats;

    return typedStats.map((stat) => ({
      companyName: stat.companyName,
      totalReviews: parseInt(stat.totalReviews),
      avgOverall: parseFloat(stat.avgOverall).toFixed(1),
    }));
  }

  async getPendingReviews(page = 1, limit = 10) {
    const [data, total] = await this.reviewRepo.findAndCount({
      where: { status: ReviewStatus.PENDING },
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
    return { success: true, message: `Review status updated to ${status}` };
  }
}
