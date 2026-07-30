import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { CompanyReview } from './review.entity';

@Entity('review_responses')
export class ReviewResponse extends BaseEntity {
  @ManyToOne(() => CompanyReview, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review: CompanyReview;

  @Column({ type: 'uuid' })
  @Index()
  review_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employer_user_id' })
  employer: User;

  @Column({ type: 'uuid' })
  @Index()
  employer_user_id: string;

  @Column('text')
  responseText: string;
}
