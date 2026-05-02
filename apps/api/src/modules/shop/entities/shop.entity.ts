import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity('shop_categories')
export class ShopCategory extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => ShopSubcategory, (sub) => sub.category)
  subcategories: ShopSubcategory[];
}

@Entity('shop_subcategories')
export class ShopSubcategory extends BaseEntity {
  @Column()
  name: string;

  @ManyToOne(() => ShopCategory, (cat) => cat.subcategories)
  category: ShopCategory;
}

export enum ListingType {
  DIGITAL = 'digital',
  PHYSICAL = 'physical',
  SERVICE = 'service',
}

export enum PricingType {
  PER_UNIT = 'per_unit',
  REQUEST_QUOTE = 'request_quote',
}

export enum Currency {
  NGN = 'NGN',
  USD = 'USD',
  EUR = 'EUR',
}

@Entity('shop_products')
export class ShopProduct extends BaseEntity {
  @ManyToOne(() => User)
  seller: User;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: ListingType })
  listingType: ListingType;

  @ManyToOne(() => ShopSubcategory)
  subcategory: ShopSubcategory;

  @Column({ type: 'enum', enum: PricingType })
  pricingType: PricingType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'enum', enum: Currency, default: Currency.NGN })
  currency: Currency;

  @Column({ nullable: true })
  priceUnit: string;

  @Column({ default: 1 })
  minQuantity: number;

  @Column({ default: false })
  priceMayVary: boolean;

  @Column({ nullable: true })
  fileS3Key: string;

  @Column('text', { array: true, nullable: true })
  imageUrls: string[];

  @Column({ default: 0 })
  downloadCount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isWorkRelatedConfirmed: boolean;
}
