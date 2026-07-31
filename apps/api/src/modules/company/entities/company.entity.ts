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

  @Column({ type: 'varchar', length: 150, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  companySize: string;

  // OVERALL RATINGS
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  averageRating: number;

  // WORKPLACE FACTORS
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  ratingCulture: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  ratingDiversity: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  ratingWorkLife: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  ratingCompensation: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  ratingCareer: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  ratingManagement: number;

  // DEMOGRAPHICS
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  ratingRace: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  ratingGender: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  ratingSexualOrientation: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  ratingDisability: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  ratingParent: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.00 })
  ratingVeterans: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @OneToMany(() => CompanyReview, (review) => review.company)
  reviews: CompanyReview[];
}
