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
  isMfaEnabled: boolean;

  @Column({ type: 'enum', enum: SellerStatus, default: SellerStatus.NONE })
  sellerStatus: SellerStatus;

  @OneToOne(() => SeekerProfile, (profile) => profile.user)
  seekerProfile: SeekerProfile;

  @OneToOne(() => EmployerProfile, (profile) => profile.user)
  employerProfile: EmployerProfile;
}
