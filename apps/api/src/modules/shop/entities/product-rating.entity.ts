import { Entity, Column, ManyToOne, Unique, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { ShopProduct } from './shop.entity';

/**
 * Product Rating Entity
 * Tracks buyer ratings for completed orders
 * One rating per buyer per product (unique constraint)
 */
@Entity('product_ratings')
@Unique(['product', 'buyer']) // One rating per buyer per product
@Index(['product']) // For aggregating ratings
@Index(['buyer']) // For user's ratings
@Index(['createdAt']) // For sorting by recent
export class ProductRating extends BaseEntity {
  @ManyToOne(() => ShopProduct, { onDelete: 'CASCADE' })
  product: ShopProduct;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  buyer: User;

  @Column({ type: 'int', default: 1 })
  rating: number; // 1-5 stars

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'boolean', default: false })
  isVerifiedPurchase: boolean; // Mark as verified after checking order

  @Column({ nullable: true })
  orderId: string; // Reference to completed order
}
