import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { CommunityThread, AnonymityMode } from './community-thread.entity';

@Entity('community_comments')
export class CommunityComment extends BaseEntity {
  @ManyToOne(() => CommunityThread, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thread_id' })
  thread: CommunityThread;

  @ManyToOne(() => CommunityComment, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parent_comment_id' })
  parent_comment: CommunityComment;

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

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 0 })
  upvotes_count: number;
}
