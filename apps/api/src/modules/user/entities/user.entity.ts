import { Entity, Column, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SeekerProfile } from './seeker-profile.entity';
import { EmployerProfile } from './employer-profile.entity';
import { SellerProfile } from '../../shop/entities/seller-profile.entity';

export enum UserRole {
  SEEKER = 'seeker',
  EMPLOYER = 'employer',
  ADMIN = 'admin',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  LINKEDIN = 'linkedin',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  username: string; // @username format: name_slug_XXXX (4 random digits)

  @Column({ select: false, nullable: true }) // Hide password by default; nullable for OAuth users
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.SEEKER,
  })
  role: UserRole;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ type: 'date', nullable: true }) // Nullable for OAuth users until onboarding
  dateOfBirth: Date;

  @Column({ type: 'timestamp', nullable: true })
  tosAgreedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSuspended: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: false })
  isMfaEnabled: boolean;

  @Column({ default: false })
  isTestAccount: boolean;

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  authProvider: AuthProvider;

  @Column({ nullable: true })
  providerId: string;

  @Column({ default: true })
  isOnboardingComplete: boolean;

  @Column({ type: 'varchar', nullable: true })
  pendingEmail: string | null;

  @Column({ default: 0 })
  tokenVersion: number;

  @Column({ name: 'contact_phone', nullable: true })
  contactPhone: string;

  @Column({ name: 'whatsapp_phone', nullable: true })
  whatsappPhone: string;

  @OneToOne(() => SeekerProfile, (profile) => profile.user)
  seekerProfile: SeekerProfile;

  @OneToOne(() => EmployerProfile, (profile) => profile.user)
  employerProfile: EmployerProfile;

  @OneToOne(() => SellerProfile, (profile) => profile.user)
  sellerProfile: SellerProfile;

  @OneToOne('UserSettings', 'user')
  settings: any;

  // Note: Connect module relationships are defined in connect entities to avoid circular dependencies
}
