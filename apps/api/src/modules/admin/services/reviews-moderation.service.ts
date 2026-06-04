import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CompanyReview,
  ReviewStatus,
} from '../../review/entities/review.entity';
import { User } from '../../user/entities/user.entity';

function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

@Injectable()
export class ReviewsModerationService {
  constructor(
    @InjectRepository(CompanyReview)
    private readonly reviewRepo: Repository<CompanyReview>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getPendingReviews(page = 1, limit = 20) {
    const [data, total] = await this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('user.seekerProfile', 'seekerProfile')
      .where('review.status = :status', { status: ReviewStatus.PENDING })
      .orderBy('review.createdAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: toPlain(data), meta: { page, limit, total } };
  }

  async approveReview(reviewId: string): Promise<void> {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
    });

    if (!review) throw new NotFoundException('Review not found');
    if (review.status !== ReviewStatus.PENDING) {
      throw new BadRequestException('Only pending reviews can be approved');
    }

    await this.reviewRepo.update(
      { id: reviewId },
      { status: ReviewStatus.APPROVED },
    );

    // TODO: Update company rating aggregate
    // TODO: Send confirmation to reviewer
  }

  async rejectReview(reviewId: string): Promise<void> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');

    await this.reviewRepo.update(
      { id: reviewId },
      { status: ReviewStatus.REJECTED },
    );
    // TODO: Notify reviewer
  }

  async editAndApproveReview(
    reviewId: string,
    prosUpdate?: string,
    consUpdate?: string,
  ): Promise<void> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');

    await this.reviewRepo.update(
      { id: reviewId },
      {
        status: ReviewStatus.APPROVED,
        ...(prosUpdate && { pros: prosUpdate }),
        ...(consUpdate && { cons: consUpdate }),
      },
    );

    // TODO: Log edit by admin
  }

  async getAllReviews(
    page = 1,
    limit = 20,
    status?: ReviewStatus,
    companyName?: string,
    fromDate?: Date,
    toDate?: Date,
  ) {
    let query = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('user.seekerProfile', 'seekerProfile');

    if (status) {
      query = query.where('review.status = :status', { status });
    }

    if (companyName) {
      query = query.andWhere('review.companyName ILIKE :companyName', {
        companyName: `%${companyName}%`,
      });
    }

    if (fromDate) {
      query = query.andWhere('review.createdAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      query = query.andWhere('review.createdAt <= :toDate', { toDate });
    }

    const [data, total] = await query
      .orderBy('review.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: toPlain(data), meta: { page, limit, total } };
  }
}
