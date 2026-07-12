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
import { User } from '../../user/entities/user.entity';
import { PostComment } from './post-comment.entity';
import { PostLike } from './post-like.entity';
import { PostMedia } from './post-media.entity';
import { SavedPost } from './saved-post.entity';

export enum PostVisibility {
  PUBLIC = 'public',
  CONNECTIONS_ONLY = 'connections_only',
}

@Entity('posts')
@Index(['author', 'createdAt'])
@Index(['createdAt'])
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  author: User;

  @Column('text')
  body: string;

  @Column({
    type: 'enum',
    enum: PostVisibility,
    default: PostVisibility.PUBLIC,
  })
  visibility: PostVisibility;

  @Column('integer', { default: 0 })
  likesCount: number;

  @Column('integer', { default: 0 })
  commentsCount: number;

  @Column('integer', { default: 0 })
  sharesCount: number;

  @OneToMany(() => PostComment, (comment) => comment.post, {
    cascade: ['remove'],
  })
  comments: PostComment[];

  @OneToMany(() => PostLike, (like) => like.post, { cascade: ['remove'] })
  likes: PostLike[];

  @OneToMany(() => PostMedia, (media) => media.post, { cascade: ['remove'] })
  media: PostMedia[];

  @OneToMany(() => SavedPost, (saved) => saved.post, { cascade: ['remove'] })
  savedBy: SavedPost[];

  @Column('timestamp', { nullable: true })
  editedAt: Date | null;

  @DeleteDateColumn()
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
