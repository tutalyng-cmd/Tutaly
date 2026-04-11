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

@Entity('jobs')
export class Job extends BaseEntity {
  @Column()
  @Index({ fulltext: true })
  title: string;

  @Column('text')
  @Index({ fulltext: true })
  description: string;

  @Column()
  industry: string;

  @Column()
  role: string;

  @Column()
  salaryType: string;

  @Column()
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
