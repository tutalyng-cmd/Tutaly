import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

export enum BroadcastAudience {
  ALL = 'all',
  SEEKERS = 'seekers',
  EMPLOYERS = 'employers',
}

@Entity('newsletter_sends')
export class NewsletterSend extends BaseEntity {
  @Column()
  subject: string;

  @Column('text')
  body: string;

  @Column({ type: 'enum', enum: BroadcastAudience, default: BroadcastAudience.ALL })
  audience: BroadcastAudience;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  sentBy: User;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  sentAt: Date;

  @Column({ default: 0 })
  recipientCount: number;
}
