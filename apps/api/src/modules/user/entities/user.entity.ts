import { Entity, Column, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SeekerProfile } from './seeker-profile.entity';
import { EmployerProfile } from './employer-profile.entity';

export enum UserRole {
  SEEKER = 'seeker',
  EMPLOYER = 'employer',
  ADMIN = 'admin',
}

export enum SellerStatus {
  NONE = 'none',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  username: string; // @username format: name_slug_XXXX (4 random digits)

  @Column({ select: false }) // Hide password by default
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.SEEKER,
  })
  role: UserRole;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ type: 'date' })
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

  @Column({ type: 'enum', enum: SellerStatus, default: SellerStatus.NONE })
  sellerStatus: SellerStatus;

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

  @OneToOne('UserSettings', 'user')
  settings: any;

  // Note: Connect module relationships are defined in connect entities to avoid circular dependencies
}
