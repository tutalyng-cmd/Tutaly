import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { PostComment } from './post-comment.entity';
import { User } from '../../user/entities/user.entity';

@Entity('comment_likes')
@Index(['comment', 'user'], { unique: true })
export class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PostComment, (comment) => comment.likes, {
    onDelete: 'CASCADE',
  })
  comment: PostComment;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
