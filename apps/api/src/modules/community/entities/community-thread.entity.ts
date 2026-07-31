import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { CommunityBowl } from './community-bowl.entity';

export enum AnonymityMode {
  FULL_NAME = 'full_name',
  JOB_TITLE_ONLY = 'job_title_only',
  ANONYMOUS_EMPLOYEE = 'anonymous_employee',
}

export enum ThreadStatus {
  PUBLISHED = 'published',
  FLAGGED = 'flagged',
  DELETED = 'deleted',
}

@Entity('community_threads')
export class CommunityThread extends BaseEntity {
  @ManyToOne(() => CommunityBowl, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bowl_id' })
  bowl: CommunityBowl;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: AnonymityMode,
    default: AnonymityMode.JOB_TITLE_ONLY,
  })
  anonymity_mode: AnonymityMode;

  @Column({ length: 100, nullable: true })
  display_title_override: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', array: true, nullable: true })
  media_urls: string[];

  @Column({ default: false })
  has_poll: boolean;

  @Column({ default: 0 })
  upvotes_count: number;

  @Column({ default: 0 })
  comments_count: number;

  @Column({ type: 'enum', enum: ThreadStatus, default: ThreadStatus.PUBLISHED })
  status: ThreadStatus;
}
