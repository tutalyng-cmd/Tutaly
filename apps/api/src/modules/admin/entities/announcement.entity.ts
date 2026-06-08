import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity('announcements')
export class Announcement extends BaseEntity {
  @Column()
  title: string;

  @Column('text')
  body: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  createdBy: User;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;
}
