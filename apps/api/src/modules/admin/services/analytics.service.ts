import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../user/entities/user.entity';
import { Job } from '../../job/entities/job.entity';
import { Application } from '../../job/entities/job.entity';
import { Order, OrderStatus } from '../../shop/entities/order.entity';
import { CompanyReview, ReviewStatus } from '../../review/entities/review.entity';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Job) private readonly jobRepo: Repository<Job>,
    @InjectRepository(Application) private readonly applicationRepo: Repository<Application>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(CompanyReview) private readonly reviewRepo: Repository<CompanyReview>,
  ) {}

  /**
   * GET /admin/analytics/users
   * User growth over time, seekers vs employers breakdown.
   */
  async getUserAnalytics() {
    const totalUsers = await this.userRepo.count();
    const totalSeekers = await this.userRepo.count({ where: { role: UserRole.SEEKER } });
    const totalEmployers = await this.userRepo.count({ where: { role: UserRole.EMPLOYER } });

    // Registrations over the last 12 months
    const registrationsByMonth = await this.userRepo
      .createQueryBuilder('u')
      .select("DATE_TRUNC('month', u.createdAt)", 'month')
      .addSelect('COUNT(u.id)', 'count')
      .addSelect('u.role', 'role')
      .where("u.createdAt >= NOW() - INTERVAL '12 months'")
      .groupBy('month')
      .addGroupBy('u.role')
      .orderBy('month', 'ASC')
      .getRawMany();

    // Retention metrics (mocked/simplified calculation)
    // A real implementation would calculate cohort retention.
    // For now, let's say "Active in the last 30 days" out of total users.
    const activeUsersLast30Days = await this.userRepo
      .createQueryBuilder('u')
      .where("u.updatedAt >= NOW() - INTERVAL '30 days'")
      .getCount();

    const retentionRate = totalUsers > 0 ? Math.round((activeUsersLast30Days / totalUsers) * 100) : 0;

    return {
      totalUsers,
      totalSeekers,
      totalEmployers,
      retentionMetrics: {
        activeUsersLast30Days,
        retentionRate,
      },
      registrationsByMonth: registrationsByMonth.map((r) => ({
        month: r.month,
        role: r.role,
        count: Number(r.count),
      })),
    };
  }

  /**
   * GET /admin/analytics/jobs
   * Job stats: total posted, total applications, avg apps per job, top industries.
   */
  async getJobAnalytics() {
    const totalJobs = await this.jobRepo.count();
    const totalApplications = await this.applicationRepo.count();
    const avgApplicationsPerJob = totalJobs > 0 ? Math.round((totalApplications / totalJobs) * 100) / 100 : 0;

    // Top industries
    const topIndustries = await this.jobRepo
      .createQueryBuilder('j')
      .select('j.industry', 'industry')
      .addSelect('COUNT(j.id)', 'jobCount')
      .where('j.industry IS NOT NULL')
      .groupBy('j.industry')
      .orderBy('"jobCount"', 'DESC')
      .limit(10)
      .getRawMany();

    // Jobs posted over the last 12 months
    const jobsByMonth = await this.jobRepo
      .createQueryBuilder('j')
      .select("DATE_TRUNC('month', j.createdAt)", 'month')
      .addSelect('COUNT(j.id)', 'count')
      .where("j.createdAt >= NOW() - INTERVAL '12 months'")
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      totalJobs,
      totalApplications,
      avgApplicationsPerJob,
      topIndustries: topIndustries.map((i) => ({
        industry: i.industry,
        jobCount: Number(i.jobCount),
      })),
      jobsByMonth: jobsByMonth.map((j) => ({
        month: j.month,
        count: Number(j.count),
      })),
    };
  }

  /**
   * GET /admin/analytics/transactions
   * Transaction volume, avg order value, top selling products, top sellers.
   */
  async getTransactionAnalytics() {
    const completedStatuses = [
      OrderStatus.PAID,
      OrderStatus.COMPLETED,
      OrderStatus.DELIVERED,
      OrderStatus.CONFIRMED,
    ];

    // Overall stats
    const stats = await this.orderRepo
      .createQueryBuilder('o')
      .where('o.status IN (:...statuses)', { statuses: completedStatuses })
      .select('COUNT(o.id)', 'totalTransactions')
      .addSelect('AVG(o.amountPaid)', 'avgOrderValue')
      .addSelect('SUM(o.amountPaid)', 'totalVolume')
      .getRawOne();

    // Transaction volume over last 12 months
    const volumeByMonth = await this.orderRepo
      .createQueryBuilder('o')
      .where('o.status IN (:...statuses)', { statuses: completedStatuses })
      .andWhere("o.createdAt >= NOW() - INTERVAL '12 months'")
      .select("DATE_TRUNC('month', o.createdAt)", 'month')
      .addSelect('COUNT(o.id)', 'count')
      .addSelect('SUM(o.amountPaid)', 'volume')
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    // Top selling products
    const topProducts = await this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.product', 'product')
      .where('o.status IN (:...statuses)', { statuses: completedStatuses })
      .select('product.id', 'productId')
      .addSelect('product.title', 'title')
      .addSelect('COUNT(o.id)', 'salesCount')
      .addSelect('SUM(o.amountPaid)', 'totalRevenue')
      .groupBy('product.id')
      .addGroupBy('product.title')
      .orderBy('"salesCount"', 'DESC')
      .limit(10)
      .getRawMany();

    // Top sellers
    const topSellers = await this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.seller', 'seller')
      .where('o.status IN (:...statuses)', { statuses: completedStatuses })
      .select('seller.id', 'sellerId')
      .addSelect('seller.email', 'email')
      .addSelect('COUNT(o.id)', 'salesCount')
      .addSelect('SUM(o.sellerEarnings)', 'totalEarnings')
      .groupBy('seller.id')
      .addGroupBy('seller.email')
      .orderBy('"salesCount"', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalTransactions: Number(stats?.totalTransactions || 0),
      avgOrderValue: Math.round(Number(stats?.avgOrderValue || 0) * 100) / 100,
      totalVolume: Number(stats?.totalVolume || 0),
      volumeByMonth: volumeByMonth.map((v) => ({
        month: v.month,
        count: Number(v.count),
        volume: Number(v.volume || 0),
      })),
      topProducts: topProducts.map((p) => ({
        productId: p.productId,
        title: p.title,
        salesCount: Number(p.salesCount),
        totalRevenue: Number(p.totalRevenue || 0),
      })),
      topSellers: topSellers.map((s) => ({
        sellerId: s.sellerId,
        email: s.email,
        salesCount: Number(s.salesCount),
        totalEarnings: Number(s.totalEarnings || 0),
      })),
    };
  }

  /**
   * GET /admin/analytics/reviews
   * Review submission rate, approval rate, top reviewed companies.
   */
  async getReviewAnalytics() {
    const totalReviews = await this.reviewRepo.count();
    const approvedReviews = await this.reviewRepo.count({ where: { status: ReviewStatus.APPROVED } });
    const pendingReviews = await this.reviewRepo.count({ where: { status: ReviewStatus.PENDING } });
    const rejectedReviews = await this.reviewRepo.count({ where: { status: ReviewStatus.REJECTED } });

    const approvalRate = totalReviews > 0
      ? Math.round((approvedReviews / totalReviews) * 10000) / 100
      : 0;

    // Top reviewed companies
    const topCompanies = await this.reviewRepo
      .createQueryBuilder('r')
      .where('r.status = :status', { status: ReviewStatus.APPROVED })
      .select('r.companyName', 'companyName')
      .addSelect('COUNT(r.id)', 'reviewCount')
      .addSelect('AVG(r.ratingOverall)', 'avgRating')
      .groupBy('r.companyName')
      .orderBy('"reviewCount"', 'DESC')
      .limit(10)
      .getRawMany();

    // Reviews submitted over the last 12 months
    const reviewsByMonth = await this.reviewRepo
      .createQueryBuilder('r')
      .select("DATE_TRUNC('month', r.createdAt)", 'month')
      .addSelect('COUNT(r.id)', 'count')
      .where("r.createdAt >= NOW() - INTERVAL '12 months'")
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      totalReviews,
      approvedReviews,
      pendingReviews,
      rejectedReviews,
      approvalRate,
      topCompanies: topCompanies.map((c) => ({
        companyName: c.companyName,
        reviewCount: Number(c.reviewCount),
        avgRating: Math.round(Number(c.avgRating || 0) * 100) / 100,
      })),
      reviewsByMonth: reviewsByMonth.map((r) => ({
        month: r.month,
        count: Number(r.count),
      })),
    };
  }
}
