import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum UserRole {
  SEEKER = 'seeker',
  EMPLOYER = 'employer',
  ADMIN = 'admin',
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

  @OneToOne(() => SeekerProfile, (profile) => profile.user)
  seekerProfile: SeekerProfile;

  @OneToOne(() => EmployerProfile, (profile) => profile.user)
  employerProfile: EmployerProfile;
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
}

@Entity('employer_profiles')
export class EmployerProfile extends BaseEntity {
  @OneToOne(() => User, (user) => user.employerProfile)
  @JoinColumn()
  user: User;

  @Column()
  companyName: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  website: string;

  @Column('text', { nullable: true })
  companyBio: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ default: false })
  isVerified: boolean;
}
