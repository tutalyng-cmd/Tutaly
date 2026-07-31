import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalaryReview } from '../review/entities/review.entity';
import { Salary } from './entities/salary.entity';
import { SalaryAggregate } from './entities/salary-aggregate.entity';
import { CreateSalaryDto } from './dto/create-salary.dto';

export interface SalaryAggregateResult {
  totalSubmissions: string;
  avgSalary: string;
  minSalary: string;
  maxSalary: string;
  currency: string;
  salaryPeriod: string;
}

export interface PopularRoleResult {
  role: string;
  totalSubmissions: string;
  minSalary: string;
  maxSalary: string;
  avgSalary: string;
}

@Injectable()
export class SalaryService {
  constructor(
    @InjectRepository(SalaryReview)
    private readonly salaryReviewRepo: Repository<SalaryReview>,
    @InjectRepository(Salary)
    private readonly salaryRepo: Repository<Salary>,
    @InjectRepository(SalaryAggregate)
    private readonly aggregateRepo: Repository<SalaryAggregate>,
  ) {}

  // --- EXISTING LOGIC (Unchanged for backward compatibility) ---

  async create(dto: CreateSalaryDto) {
    const salary = this.salaryReviewRepo.create(dto);
    await this.salaryReviewRepo.save(salary);
    return { success: true, message: 'Salary review submitted anonymously.' };
  }

  async getAggregates(industry?: string, role?: string, location?: string) {
    const query = this.salaryReviewRepo.createQueryBuilder('salary');

    if (industry) query.andWhere('salary.industry = :industry', { industry });
    if (role) query.andWhere('salary.role = :role', { role });
    if (location) query.andWhere('salary.location = :location', { location });

    const stats = await query
      .select('COUNT(*)', 'totalSubmissions')
      .addSelect('AVG(salary.salaryAmount)', 'avgSalary')
      .addSelect('MIN(salary.salaryAmount)', 'minSalary')
      .addSelect('MAX(salary.salaryAmount)', 'maxSalary')
      .addSelect('salary.currency', 'currency')
      .addSelect('salary.salaryPeriod', 'salaryPeriod')
      .groupBy('salary.currency')
      .addGroupBy('salary.salaryPeriod')
      .getRawMany();

    const typedStats: SalaryAggregateResult[] =
      stats as unknown as SalaryAggregateResult[];

    return typedStats.map((stat) => ({
      totalSubmissions: parseInt(stat.totalSubmissions),
      avgSalary: parseFloat(stat.avgSalary).toFixed(2),
      minSalary: parseFloat(stat.minSalary).toFixed(2),
      maxSalary: parseFloat(stat.maxSalary).toFixed(2),
      currency: stat.currency,
      salaryPeriod: stat.salaryPeriod,
    }));
  }

  async getPopularRoles(limit = 12) {
    const stats = await this.salaryReviewRepo
      .createQueryBuilder('salary')
      .select('salary.role', 'role')
      .addSelect('COUNT(*)', 'totalSubmissions')
      .addSelect('MIN(salary.salaryAmount)', 'minSalary')
      .addSelect('MAX(salary.salaryAmount)', 'maxSalary')
      .addSelect('AVG(salary.salaryAmount)', 'avgSalary')
      .groupBy('salary.role')
      .orderBy('"totalSubmissions"', 'DESC')
      .limit(limit)
      .getRawMany();

    const typedStats: PopularRoleResult[] =
      stats as unknown as PopularRoleResult[];

    return typedStats.map((stat) => ({
      role: stat.role,
      totalSubmissions: parseInt(stat.totalSubmissions),
      minSalary: parseFloat(stat.minSalary).toFixed(2),
      maxSalary: parseFloat(stat.maxSalary).toFixed(2),
      avgSalary: parseFloat(stat.avgSalary).toFixed(2),
    }));
  }

  async getRecent(page = 1, limit = 10, industry?: string, role?: string) {
    const where: import('typeorm').FindOptionsWhere<SalaryReview> = {};
    if (industry) where.industry = industry;
    if (role) where.role = role;

    const [data, total] = await this.salaryReviewRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { data, meta: { page, limit, total } };
  }

  // --- NEW SALARY INSIGHTS ENGINE (V2) ---

  /**
   * Search salaries (Aggregated)
   */
  async searchSalaryEngine(title: string, location?: string) {
    if (!title) throw new BadRequestException('Job title is required');
    const canonical = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const query = this.aggregateRepo
      .createQueryBuilder('agg')
      .where('agg.canonical_job_title = :canonical', { canonical });

    if (location) {
      query.andWhere('agg.location = :location', { location });
    } else {
      query.andWhere('agg.location = :location', { location: 'ALL' });
    }

    const result = await query.getOne();

    return {
      success: true,
      data: result || null,
      message: result
        ? 'Stats retrieved successfully'
        : 'No data found for this role and location',
    };
  }

  /**
   * Submit new salary
   */
  async submitSalaryEngine(data: {
    job_title: string;
    location: string;
    base_pay: number;
    pay_period: string;
    bonus_pay?: number;
    years_experience?: number;
    company_id?: string;
  }) {
    const canonical = data.job_title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const salary = this.salaryRepo.create({
      job_title: data.job_title,
      canonical_job_title: canonical,
      location: data.location,
      base_pay: data.base_pay,
      pay_period: data.pay_period,
      bonus_pay: data.bonus_pay || 0,
      years_experience: data.years_experience,
      company_id: data.company_id,
      status: 'approved', // Auto-approved for this implementation
    });

    await this.salaryRepo.save(salary);

    // After submission, trigger aggregate update (naive approach inline)
    await this.recalculateAggregates(canonical, data.location);
    await this.recalculateAggregates(canonical, 'ALL');

    return {
      success: true,
      message: 'Salary submitted and aggregated successfully.',
    };
  }

  /**
   * Get top paying companies for a canonical title
   */
  async getTopPayingCompanies(title: string) {
    const canonical = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const results = await this.salaryRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.company', 'company')
      .where('s.canonical_job_title = :canonical', { canonical })
      .andWhere('s.company_id IS NOT NULL')
      .select([
        'company.id as id',
        'company.name as name',
        'company.slug as slug',
        'AVG(s.base_pay) as avg_pay',
        'COUNT(s.id) as sample_size',
      ])
      .groupBy('company.id')
      .having('COUNT(s.id) > 0')
      .orderBy('avg_pay', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      success: true,
      data: results.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        averagePay: parseFloat(r.avg_pay),
        sampleSize: parseInt(r.sample_size),
      })),
    };
  }

  /**
   * Recalculate percentiles natively using Postgres PERCENTILE_CONT
   */
  private async recalculateAggregates(canonical: string, location: string) {
    let baseQuery = `
      SELECT 
        COUNT(id) as sample_count,
        MIN(base_pay) as min_pay,
        MAX(base_pay) as max_pay,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY base_pay) as p25_pay,
        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY base_pay) as median_pay,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY base_pay) as p75_pay
      FROM salaries
      WHERE canonical_job_title = $1 AND status = 'approved'
    `;

    const params: any[] = [canonical];
    if (location !== 'ALL') {
      baseQuery += ` AND location = $2`;
      params.push(location);
    }

    const [stats] = await this.salaryRepo.query(baseQuery, params);

    if (stats && parseInt(stats.sample_count) > 0) {
      let aggregate = await this.aggregateRepo.findOne({
        where: { canonical_job_title: canonical, location },
      });

      if (!aggregate) {
        aggregate = this.aggregateRepo.create({
          canonical_job_title: canonical,
          location,
        });
      }

      aggregate.sample_count = parseInt(stats.sample_count);
      aggregate.min_pay = stats.min_pay;
      aggregate.max_pay = stats.max_pay;
      aggregate.p25_pay = stats.p25_pay;
      aggregate.median_pay = stats.median_pay;
      aggregate.p75_pay = stats.p75_pay;

      await this.aggregateRepo.save(aggregate);
    }
  }
}
