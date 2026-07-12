import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum NotificationType {
  POST_LIKE = 'post_like',
  POST_COMMENT = 'post_comment',
  COMMENT_REPLY = 'comment_reply',
  COMMENT_LIKE = 'comment_like',
  NEW_FOLLOWER = 'new_follower',
}

export enum NotificationTargetType {
  POST = 'post',
  COMMENT = 'comment',
  USER = 'user',
}

@Entity('connect_notifications')
@Index(['recipient', 'createdAt'])
export class ConnectNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  recipient: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  actor: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationTargetType,
  })
  targetType: NotificationTargetType;

  @Column('uuid')
  targetId: string;

  @Column('timestamp', { nullable: true })
  readAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
