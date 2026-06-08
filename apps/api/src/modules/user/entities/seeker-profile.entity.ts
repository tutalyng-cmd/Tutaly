import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from './user.entity';

export enum SellerPlan {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
}

@Entity('seeker_profiles')
export class SeekerProfile extends BaseEntity {
  @OneToOne(() => User, (user) => user.seekerProfile)
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  headline: string;

  @Column('text', { nullable: true })
  bio: string;

  @Column({ nullable: true })
  resumeUrl: string;

  @Column('text', { array: true, nullable: true })
  skills: string[];

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column('jsonb', { nullable: true, default: {} })
  socialLinks: { linkedin?: string; portfolio?: string };

  // Seller marketplace fields
  @Column({ name: 'contact_phone', nullable: true })
  contactPhone: string; // Business phone for physical orders

  @Column({ name: 'contact_whatsapp', nullable: true })
  contactWhatsapp: string; // WhatsApp for communication

  @Column({ name: 'seller_plan', type: 'enum', enum: SellerPlan, default: SellerPlan.FREE })
  sellerPlan: SellerPlan;
}
