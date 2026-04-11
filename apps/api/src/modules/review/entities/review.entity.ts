import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('company_reviews')
export class CompanyReview extends BaseEntity {
  @Column()
  @Index()
  companyName: string;

  @Column({ nullable: true })
  sector: string;

  @Column({ nullable: true })
  position: string;

  @Column({ type: 'smallint' })
  ratingOverall: number;

  @Column({ type: 'smallint', nullable: true })
  ratingWorkLife: number;

  @Column({ type: 'smallint', nullable: true })
  ratingPay: number;

  @Column({ type: 'smallint', nullable: true })
  ratingManagement: number;

  @Column({ type: 'smallint', nullable: true })
  ratingCulture: number;

  @Column('text')
  pros: string;

  @Column('text')
  cons: string;

  @Column({ type: 'boolean' })
  recommend: boolean;

  @Column({ length: 100 })
  displayName: string; // The nickname

  @Column({ select: false }) // Internal only
  submitterHash: string; // Hashed IP+UA

  @ManyToOne(() => User, { nullable: true })
  user: User; // Null for guest submissions

  @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.PENDING })
  @Index()
  status: ReviewStatus;
}

export enum SalaryPeriod {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

@Entity('salary_reviews')
export class SalaryReview extends BaseEntity {
  @Column()
  @Index()
  industry: string;

  @Column({ nullable: true })
  company: string;

  @Column()
  @Index()
  role: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  salaryAmount: number;

  @Column({ type: 'char', length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'enum', enum: SalaryPeriod })
  salaryPeriod: SalaryPeriod;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'smallint' })
  submissionYear: number;
}
