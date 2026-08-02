import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Company } from '../../company/entities/company.entity';

export enum BowlCategory {
  INDUSTRY = 'industry',
  COMPANY = 'company',
  TOPIC = 'topic',
}

@Entity('community_bowls')
export class CommunityBowl extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  icon_url: string;

  @Column({ type: 'enum', enum: BowlCategory, default: BowlCategory.INDUSTRY })
  category: BowlCategory;

  @ManyToOne(() => Company, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ default: 0 })
  member_count: number;

  @Column({ default: 0 })
  post_count: number;
}
