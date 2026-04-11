import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from './user.entity';

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
