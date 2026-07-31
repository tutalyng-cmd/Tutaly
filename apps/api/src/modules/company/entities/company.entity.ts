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
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  averageRating: number;

  // WORKPLACE FACTORS
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  ratingCulture: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  ratingDiversity: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  ratingWorkLife: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  ratingCompensation: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  ratingCareer: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  ratingManagement: number;

  // DEMOGRAPHICS
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  ratingRace: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  ratingGender: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  ratingSexualOrientation: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  ratingDisability: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  ratingParent: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  ratingVeterans: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @OneToMany(() => CompanyReview, (review) => review.company)
  reviews: CompanyReview[];
}
