import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly dataSource: DataSource) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getPlatformStats() {
    try {
      const [{ count: totalJobs }] = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM jobs WHERE status = 'active'`,
      );
      const [{ count: totalCompanies }] = await this.dataSource.query(
        `SELECT COUNT(DISTINCT "companyName") as count FROM company_reviews`,
      );
      const [{ count: totalCountries }] = await this.dataSource.query(
        `SELECT COUNT(DISTINCT country) as count FROM jobs WHERE status = 'active'`,
      );
      const [{ count: totalProfessionals }] = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM users WHERE role = 'seeker'`,
      );

      return {
        activeJobs: parseInt(totalJobs, 10) || 0,
        companiesReviewed: parseInt(totalCompanies, 10) || 0,
        countriesRepresented: parseInt(totalCountries, 10) || 0,
        professionals: parseInt(totalProfessionals, 10) || 0,
      };
    } catch (error) {
      this.logger.error('Failed to fetch platform stats', error);
      // Fallback: maybe the column was company_name if using snake_case strategy
      try {
        const [{ count: totalJobs }] = await this.dataSource.query(
          `SELECT COUNT(*) as count FROM jobs WHERE status = 'active'`,
        );
        const [{ count: totalCompanies }] = await this.dataSource.query(
          `SELECT COUNT(DISTINCT company_name) as count FROM company_reviews`,
        );
        const [{ count: totalCountries }] = await this.dataSource.query(
          `SELECT COUNT(DISTINCT country) as count FROM jobs WHERE status = 'active'`,
        );
        const [{ count: totalProfessionals }] = await this.dataSource.query(
          `SELECT COUNT(*) as count FROM users WHERE role = 'seeker'`,
        );
        return {
          activeJobs: parseInt(totalJobs, 10) || 0,
          companiesReviewed: parseInt(totalCompanies, 10) || 0,
          countriesRepresented: parseInt(totalCountries, 10) || 0,
          professionals: parseInt(totalProfessionals, 10) || 0,
        };
      } catch {
        return {
          activeJobs: 0,
          companiesReviewed: 0,
          countriesRepresented: 0,
          professionals: 0,
        };
      }
    }
  }
}
