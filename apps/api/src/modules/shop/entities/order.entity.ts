import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { ShopProduct, Currency } from './shop.entity';

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID_ESCROW = 'paid_escrow',
  DELIVERED = 'delivered',
  COMPLETE = 'complete',
  AUTO_COMPLETE = 'auto_complete',
  DISPUTED = 'disputed',
  REFUNDED = 'refunded',
}

export enum PaymentGateway {
  FLUTTERWAVE = 'flutterwave',
  PAYSTACK = 'paystack',
}

@Entity('orders')
export class Order extends BaseEntity {
  @ManyToOne(() => User)
  buyer: User;

  @ManyToOne(() => ShopProduct)
  product: ShopProduct;

  @ManyToOne(() => User)
  seller: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commissionAmount: number; // 20%

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sellerEarnings: number; // 80%

  @Column({ type: 'enum', enum: Currency, default: Currency.NGN })
  currency: Currency;

  @Column({ type: 'enum', enum: PaymentGateway, default: PaymentGateway.FLUTTERWAVE })
  paymentGateway: PaymentGateway;

  @Column({ unique: true, nullable: true })
  paymentRef: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING_PAYMENT,
  })
  status: OrderStatus;

  @Column({ type: 'timestamp', nullable: true })
  escrowReleaseAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveryConfirmedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ default: 0 })
  downloadCount: number;
}

export enum QuoteStatus {
  PENDING = 'pending',
  QUOTED = 'quoted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('quote_requests')
export class QuoteRequest extends BaseEntity {
  @ManyToOne(() => ShopProduct)
  product: ShopProduct;

  @ManyToOne(() => User)
  buyer: User;

  @ManyToOne(() => User)
  seller: User;

  @Column('text')
  requirements: string;

  @Column({ nullable: true })
  budgetRange: string;

  @Column({ type: 'date', nullable: true })
  deadlineRequested: Date;

  @Column({ type: 'enum', enum: QuoteStatus, default: QuoteStatus.PENDING })
  status: QuoteStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quotedPrice: number;

  @Column('text', { nullable: true })
  sellerNotes: string;

  @Column({ default: false })
  checkoutLinkGenerated: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;
}

export enum DisputeStatus {
  OPEN = 'open',
  RESOLVED_REFUND = 'resolved_refund',
  RESOLVED_RELEASE = 'resolved_release',
}

@Entity('order_disputes')
export class OrderDispute extends BaseEntity {
  @OneToOne(() => Order)
  @JoinColumn()
  order: Order;

  @ManyToOne(() => User)
  raisedBy: User;

  @Column('text')
  reason: string;

  @Column('text', { array: true, nullable: true })
  evidenceUrls: string[];

  @Column({ type: 'enum', enum: DisputeStatus, default: DisputeStatus.OPEN })
  status: DisputeStatus;

  @ManyToOne(() => User, { nullable: true })
  resolvedBy: User;

  @Column('text', { nullable: true })
  resolutionNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;
}
