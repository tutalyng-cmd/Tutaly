import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalaryReview } from '../review/entities/review.entity';
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
    private readonly salaryRepo: Repository<SalaryReview>,
  ) {}

  async create(dto: CreateSalaryDto) {
    const salary = this.salaryRepo.create(dto);
    await this.salaryRepo.save(salary);
    return { success: true, message: 'Salary review submitted anonymously.' };
  }

  async getAggregates(industry?: string, role?: string, location?: string) {
    const query = this.salaryRepo.createQueryBuilder('salary');

    if (industry) {
      query.andWhere('salary.industry = :industry', { industry });
    }
    if (role) {
      query.andWhere('salary.role = :role', { role });
    }
    if (location) {
      query.andWhere('salary.location = :location', { location });
    }

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
    const stats = await this.salaryRepo
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

    const [data, total] = await this.salaryRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { data, meta: { page, limit, total } };
  }
}
