import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('salary_aggregates')
@Index(['canonical_job_title', 'location'], { unique: true })
export class SalaryAggregate extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  canonical_job_title: string;

  @Column({ type: 'varchar', length: 150, default: 'ALL' })
  location: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  median_pay: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  p25_pay: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  p75_pay: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  min_pay: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  max_pay: number;

  @Column({ type: 'int', default: 0 })
  sample_count: number;
}
