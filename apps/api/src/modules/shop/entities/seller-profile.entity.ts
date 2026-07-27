import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity('seller_profiles')
export class SellerProfile extends BaseEntity {
  @OneToOne(() => User, (user) => user.sellerProfile)
  @JoinColumn()
  user: User;

  @Column('text')
  bio: string;

  @Column()
  categoryFocus: string;
}
