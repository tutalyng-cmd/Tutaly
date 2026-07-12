import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from '../../user/entities/user.entity';
import { CommentLike } from './comment-like.entity';

@Entity('post_comments')
@Index(['post', 'createdAt'])
export class PostComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  author: User;

  @ManyToOne(() => PostComment, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parentComment: PostComment | null;

  @OneToMany(() => PostComment, (comment) => comment.parentComment)
  replies: PostComment[];

  @Column('text')
  body: string;

  @Column('integer', { default: 0 })
  likesCount: number;

  @OneToMany(() => CommentLike, (like) => like.comment, { cascade: ['remove'] })
  likes: CommentLike[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
