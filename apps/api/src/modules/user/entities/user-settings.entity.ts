import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from './user.entity';

@Entity('user_settings')
export class UserSettings extends BaseEntity {
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'jsonb', default: {} })
  notifications: {
    newJobsMatchingProfile?: boolean;
    jobApplicationStatusChanged?: boolean;
    reviewApproved?: boolean;
    newFollower?: boolean;
    followRequest?: boolean;
    newMessage?: boolean;
    postLiked?: boolean;
    postCommented?: boolean;
    orderUpdates?: boolean;
    platformAnnouncements?: boolean;
  };

  @Column({ type: 'jsonb', default: {} })
  privacy: {
    profileVisibility?: 'public' | 'connections_only';
    followApproval?: 'auto' | 'manual';
    showInDiscover?: boolean;
    showSalaryOnProfile?: boolean;
  };

  @Column({ type: 'jsonb', default: {} })
  cookies: {
    analytics?: boolean;
    marketing?: boolean;
    functional?: boolean;
  };
}
