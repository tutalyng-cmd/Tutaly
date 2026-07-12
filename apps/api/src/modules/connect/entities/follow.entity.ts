import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  Unique,
  Check,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum FollowStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum FollowApprovalSetting {
  AUTO = 'auto',
  MANUAL = 'manual',
}

@Entity('follows')
@Unique(['follower', 'following'])
@Index(['follower', 'status'])
@Index(['following', 'status'])
@Index(['follower'])
@Index(['following'])
@Check('"followerId" != "followingId"')
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  follower: User; // User doing the following

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  following: User; // User being followed

  @Column('enum', { enum: FollowStatus, default: FollowStatus.ACCEPTED })
  status: FollowStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column('timestamp', { nullable: true })
  acceptedAt?: Date;
}
