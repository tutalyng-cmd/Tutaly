import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Post } from './post.entity';

export enum MediaType {
  IMAGE = 'image',
}

@Entity('post_media')
export class PostMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  post: Post;

  @Column('text')
  mediaUrl: string;

  @Column({
    type: 'enum',
    enum: MediaType,
    default: MediaType.IMAGE,
  })
  mediaType: MediaType;

  @Column('integer', { nullable: true })
  width: number;

  @Column('integer', { nullable: true })
  height: number;

  @Column('smallint', { default: 0 })
  orderIndex: number;
}
