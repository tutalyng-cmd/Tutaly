import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Report, ReportStatus } from '../../connect/entities/report.entity';
import { Post } from '../../connect/entities/post.entity';
import { User } from '../../user/entities/user.entity';

function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

@Injectable()
export class ReportsModerationService {
  constructor(
    @InjectRepository(Report) private readonly reportRepo: Repository<Report>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getPendingReports(page = 1, limit = 20) {
    const [data, total] = await this.reportRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reporter', 'reporter')
      .where('report.status = :status', { status: ReportStatus.PENDING })
      .orderBy('report.createdAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: toPlain(data), meta: { page, limit, total } };
  }

  async removeContent(reportId: string): Promise<void> {
    const report = await this.reportRepo.findOne({
      where: { id: reportId },
    });
    if (!report) throw new NotFoundException('Report not found');

    // Soft delete the reported post
    if (report.targetType === 'post' && report.targetId) {
      await this.postRepo.softDelete({ id: report.targetId });
    }

    await this.reportRepo.update(
      { id: reportId },
      { status: ReportStatus.REVIEWED_ACTIONED },
    );
  }

  async dismissReport(reportId: string): Promise<void> {
    const report = await this.reportRepo.findOne({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');

    await this.reportRepo.update(
      { id: reportId },
      { status: ReportStatus.REVIEWED_DISMISSED },
    );
  }

  async bulkDismissReports(reportIds: string[]): Promise<void> {
    await this.reportRepo.update(
      { id: In(reportIds) },
      { status: ReportStatus.REVIEWED_DISMISSED },
    );
  }

  async getAllReports(page = 1, limit = 20, status?: ReportStatus) {
    let query = this.reportRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reporter', 'reporter');

    if (status) {
      query = query.where('report.status = :status', { status });
    }

    const [data, total] = await query
      .orderBy('report.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: toPlain(data), meta: { page, limit, total } };
  }
}
