import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity('legal_pages')
export class LegalPage extends BaseEntity {
  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User)
  updatedBy: User;
}

export enum AdType {
  BANNER = 'banner',
  FEATURED_JOB = 'featured_job',
  SPONSORED = 'sponsored',
}

@Entity('ads')
export class Ad extends BaseEntity {
  @ManyToOne(() => User)
  advertiser: User;

  @Column({ type: 'enum', enum: AdType })
  type: AdType;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  targetUrl: string;

  @Column()
  placement: string;

  @Column({ type: 'timestamp' })
  startsAt: Date;

  @Column({ type: 'timestamp' })
  endsAt: Date;

  @Column({ default: true })
  isActive: boolean;
}

@Entity('notifications')
export class Notification extends BaseEntity {
  @ManyToOne(() => User)
  @Index()
  user: User;

  @Column()
  type: string;

  @Column('text')
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  link: string;
}

export enum SellerApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('seller_applications')
export class SellerApplication extends BaseEntity {
  @ManyToOne(() => User)
  user: User;

  @Column('text')
  bio: string;

  @Column()
  categoryFocus: string;

  @Column({
    type: 'enum',
    enum: SellerApplicationStatus,
    default: SellerApplicationStatus.PENDING,
  })
  status: SellerApplicationStatus;

  @ManyToOne(() => User, { nullable: true })
  reviewedBy: User;
}
