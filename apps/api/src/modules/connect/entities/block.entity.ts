import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Index,
  Unique,
  Check,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('blocks')
@Unique(['blocker', 'blocked'])
@Index(['blocker'])
@Index(['blocked'])
@Check('"blockerId" != "blockedId"')
export class Block {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  blocker: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  blocked: User;

  @CreateDateColumn()
  createdAt: Date;
}
