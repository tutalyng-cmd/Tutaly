import { Entity, Column, ManyToOne, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

export enum JobStatus {
  PENDING_REVIEW = 'pending_review',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REMOVED = 'removed',
}

export enum WorkMode {
  REMOTE = 'remote',
  HYBRID = 'hybrid',
  ONSITE = 'onsite',
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
}

export enum JobType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  CONTRACT = 'contract',
  FREELANCE = 'freelance',
  INTERNSHIP = 'internship',
}

@Entity('jobs')
export class Job extends BaseEntity {
  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  industry: string;

  @Column()
  role: string;

  @Column({
    type: 'enum',
    enum: JobType,
    default: JobType.FULL_TIME,
  })
  jobType: JobType;

  @Column({
    type: 'enum',
    enum: ExperienceLevel,
    default: ExperienceLevel.MID,
  })
  experienceLevel: ExperienceLevel;

  @Column({ type: 'int', nullable: true })
  minSalary: number;

  @Column({ type: 'int', nullable: true })
  maxSalary: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: 'Nigeria' })
  country: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  area: string;

  // Keeping original location string just in case, but marking optional
  @Column({ nullable: true })
  location: string;

  @Column({
    type: 'enum',
    enum: WorkMode,
    default: WorkMode.ONSITE,
  })
  workMode: WorkMode;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.PENDING_REVIEW,
  })
  status: JobStatus;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: false })
  isUrgent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  @ManyToOne(() => User)
  employer: User;
}

export enum ApplicationStatus {
  APPLIED = 'applied',
  REVIEWING = 'reviewing',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  OFFERED = 'offered',
}

@Entity('applications')
@Unique(['job', 'seeker'])
export class Application extends BaseEntity {
  @ManyToOne(() => Job)
  job: Job;

  @ManyToOne(() => User)
  seeker: User;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.APPLIED,
  })
  status: ApplicationStatus;

  @Column('text', { nullable: true })
  coverNote: string;
}

@Entity('saved_jobs')
@Unique(['job', 'seeker'])
export class SavedJob extends BaseEntity {
  @ManyToOne(() => Job)
  job: Job;

  @ManyToOne(() => User)
  seeker: User;
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  DISMISSED = 'dismissed',
}

@Entity('reported_jobs')
export class ReportedJob extends BaseEntity {
  @ManyToOne(() => Job)
  job: Job;

  @ManyToOne(() => User)
  reporter: User;

  @Column('text')
  reason: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;
}
