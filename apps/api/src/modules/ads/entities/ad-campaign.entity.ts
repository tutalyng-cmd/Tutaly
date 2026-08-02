import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  AdGoal,
  AdFormat,
  CampaignStatus,
  PaymentGateway,
} from '../enums/ads.enums';

@Entity('ad_campaigns')
export class AdCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  advertiser_id: string; // FK -> users.id

  @Column({ type: 'enum', enum: AdGoal })
  goal: AdGoal;

  @Column({ type: 'enum', enum: AdFormat })
  format: AdFormat;

  @Column({ type: 'uuid', nullable: true })
  job_id: string | null; // FK -> jobs.id

  @Column({ type: 'uuid', nullable: true })
  product_id: string | null; // FK -> shop_products.id

  @Column({ type: 'varchar', nullable: true })
  image_url: string | null;

  @Column()
  destination_url: string;

  @Column({ type: 'varchar', nullable: true })
  alt_text: string | null;

  @Column({ type: 'varchar', nullable: true })
  headline: string | null;

  @Column({ type: 'text', nullable: true })
  body_text: string | null;

  @Column({ type: 'jsonb', nullable: true })
  target_countries: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  target_states: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  target_areas: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  target_industries: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  target_roles: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  target_user_types: string[] | null;

  @Column({ type: 'jsonb' })
  placements: string[];

  @Column()
  starts_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  ends_at: Date | null;

  @Column({ default: false })
  run_continuously: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  daily_budget: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_budget: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_spent: number;

  @Column({ default: 0 })
  impression_count: number;

  @Column({ default: 0 })
  click_count: number;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.PENDING_PAYMENT,
  })
  status: CampaignStatus;

  @Column({ type: 'varchar', nullable: true })
  rejection_reason: string | null;

  @Column({ type: 'uuid', nullable: true })
  reviewed_by: string | null; // FK -> users.id (admin)

  @Column({ type: 'varchar', nullable: true })
  payment_ref: string | null;

  @Column({ default: 'NGN' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentGateway, nullable: true })
  payment_gateway: PaymentGateway | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  notified_50: boolean;

  @Column({ default: false })
  notified_80: boolean;

  @Column({ default: false })
  notified_complete: boolean;
}
