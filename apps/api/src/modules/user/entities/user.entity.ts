import { Entity, Column, OneToOne } from 'typeorm';
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

  @OneToOne('SeekerProfile', 'user')
  seekerProfile: any;

  @OneToOne('EmployerProfile', 'user')
  employerProfile: any;
}
