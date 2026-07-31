import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Company } from '../../company/entities/company.entity';
import { User } from '../../user/entities/user.entity';

@Entity('salaries')
export class Salary extends BaseEntity {
  @ManyToOne(() => Company, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  company_id: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'varchar', length: 150 })
  job_title: string;

  @Column({ type: 'varchar', length: 150 })
  @Index()
  canonical_job_title: string;

  @Column({ type: 'varchar', length: 150 })
  @Index()
  location: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  base_pay: number;

  @Column({ type: 'varchar', length: 20, default: 'yearly' })
  pay_period: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.00 })
  bonus_pay: number;

  @Column({ type: 'int', nullable: true })
  years_experience: number;

  @Column({ type: 'varchar', length: 20, default: 'approved' })
  @Index()
  status: string;
}
