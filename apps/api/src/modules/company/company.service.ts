import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async findAll(page: number, limit: number, search?: string) {
    const qb = this.companyRepository.createQueryBuilder('company');
    
    if (search) {
      qb.where('company.name ILIKE :search', { search: `%${search}%` });
    }

    qb.orderBy('company.reviewCount', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      success: true,
      data,
      meta: { page, limit, total },
    };
  }

  async getTopCompanies(limit: number) {
    const data = await this.companyRepository.find({
      order: { reviewCount: 'DESC', averageRating: 'DESC' },
      take: limit,
    });

    return { success: true, data };
  }

  async findBySlug(slug: string) {
    const company = await this.companyRepository.findOne({ where: { slug } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return { success: true, data: company };
  }

  // Internal hook for aggregation
  async recalculateAggregates(companyId: string) {
    const stats = await this.companyRepository.manager.query(
      `
      SELECT 
        COUNT(id) as "reviewCount",
        AVG("ratingOverall") as "averageRating"
      FROM company_reviews
      WHERE company_id = $1 AND status = 'approved'
      `,
      [companyId]
    );

    const count = parseInt(stats[0].reviewCount || '0', 10);
    const avg = parseFloat(stats[0].averageRating || '0');

    await this.companyRepository.update(companyId, {
      reviewCount: count,
      averageRating: avg,
    });
  }
}
