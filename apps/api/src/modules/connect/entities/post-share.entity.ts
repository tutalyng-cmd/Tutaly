import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Post } from './post.entity';

@Entity('post_shares')
export class PostShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  originalPost: Post;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  sharedBy: User;

  @Column({
    type: 'enum',
    enum: ['feed', 'whatsapp', 'twitter'],
    default: 'feed',
  })
  shareType: 'feed' | 'whatsapp' | 'twitter';

  @CreateDateColumn()
  createdAt: Date;
}
