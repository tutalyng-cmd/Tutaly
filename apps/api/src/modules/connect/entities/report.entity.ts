import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED_ACTIONED = 'reviewed_actioned',
  REVIEWED_DISMISSED = 'reviewed_dismissed',
}

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  MISINFORMATION = 'misinformation',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  OTHER = 'other',
}

export enum ReportTargetType {
  POST = 'post',
  COMMENT = 'comment',
  USER = 'user',
}

@Entity('reports')
@Index(['targetType', 'targetId'])
@Index(['status', 'createdAt'])
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  reporter: User;

  @Column({ type: 'enum', enum: ReportTargetType })
  targetType: ReportTargetType;

  @Column('uuid')
  targetId: string;

  @Column('enum', { enum: ReportReason })
  reason: ReportReason;

  @Column('text', { nullable: true })
  details?: string;

  @Column('enum', { enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column('timestamp', { nullable: true })
  reviewedAt?: Date;

  @Column('uuid', { nullable: true })
  reviewedBy?: string; // Admin user ID
}
