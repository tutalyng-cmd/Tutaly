import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CompanyReview } from '../../review/entities/review.entity';

@Entity('companies')
export class Company extends BaseEntity {
  @Column()
  @Index()
  name: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  logoUrl: string;

  @Column({ length: 100, nullable: true })
  industry: string;

  @Column({ type: 'text', nullable: true })
  websiteUrl: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @OneToMany(() => CompanyReview, (review) => review.company)
  reviews: CompanyReview[];
}
