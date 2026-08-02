import { Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { CommunityThread } from './community-thread.entity';

@Entity('community_upvotes')
@Unique(['user', 'thread'])
export class CommunityUpvote extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => CommunityThread, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thread_id' })
  thread: CommunityThread;
}
