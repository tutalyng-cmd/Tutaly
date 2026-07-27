import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { ShopProduct, ListingType } from '../entities/shop.entity';

import {
  MarkDeliveredDto,
  ConfirmReceiptDto,
  OrderStatusDto,
  CartItemDto,
} from '../dto/week7.dto';

/**
 * Physical Order Service
 * Handles delivery tracking, receipt confirmation, 48hr auto-confirm
 */
@Injectable()
export class PhysicalOrderService {
  private readonly logger = new Logger(PhysicalOrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(ShopProduct)
    private readonly productRepo: Repository<ShopProduct>,
  ) {}

  /**
   * Seller marks order as delivered (physical only)
   * Starts 48hr auto-confirm window
   */
  async markDelivered(
    orderId: string,
    sellerId: string,
    _dto: MarkDeliveredDto,
  ): Promise<OrderStatusDto> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['product', 'seller', 'buyer'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify seller owns this order
    if (order.seller.id !== sellerId) {
      throw new ForbiddenException('Only the seller can mark as delivered');
    }

    // Verify order is completed (paid)
    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException(
        'Order must be completed (paid) before marking as delivered',
      );
    }

    // Verify product is physical
    if (order.product.listingType !== ListingType.PHYSICAL) {
      throw new BadRequestException(
        'Only physical products can be marked as delivered',
      );
    }

    // Mark as delivered
    order.status = OrderStatus.DELIVERED;
    order.deliveredAt = new Date();

    // Schedule auto-confirm in 48 hours
    const autoConfirmTime = new Date(Date.now() + 48 * 60 * 60 * 1000);
    order.escrowReleaseAt = autoConfirmTime;

    await this.orderRepo.save(order);

    this.logger.log(
      `Order ${orderId} marked as delivered by seller ${sellerId}`,
    );

    // TODO: Send notification to buyer via SendGrid

    return this.getOrderStatus(order);
  }

  /**
   * Buyer confirms receipt of physical order
   */
  async confirmReceipt(
    orderId: string,
    buyerId: string,
    _dto?: ConfirmReceiptDto,
  ): Promise<OrderStatusDto> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['product', 'seller', 'buyer'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify buyer is the one receiving
    if (order.buyer.id !== buyerId) {
      throw new ForbiddenException('Only the buyer can confirm receipt');
    }

    // Verify order is in delivered state
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'Order must be in delivered state to confirm receipt',
      );
    }

    // Mark as confirmed
    order.status = OrderStatus.CONFIRMED;
    order.confirmedAt = new Date();
    order.earningsReleasedAt = new Date(); // Release seller earnings immediately

    await this.orderRepo.save(order);

    this.logger.log(`Order ${orderId} confirmed by buyer ${buyerId}`);

    // TODO: Send notification to seller via SendGrid
    // TODO: Release earnings to seller wallet

    return this.getOrderStatus(order);
  }

  /**
   * Validate quantity before checkout
   * Enforces minimum quantity for per-unit listings
   */
  async validateCheckoutQuantities(items: CartItemDto[]): Promise<void> {
    for (const item of items) {
      const product = await this.productRepo.findOne({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      // Check minimum quantity
      if (item.quantity < product.minQuantity) {
        throw new BadRequestException(
          `Product "${product.title}" requires minimum quantity of ${product.minQuantity}`,
        );
      }
    }
  }

  /**
   * Get order status with all tracking info
   */
  getOrderStatus(order: Order): OrderStatusDto {
    return {
      id: order.id,
      status: order.status,
      quantity: order.quantity,
      deliveredAt: order.deliveredAt || undefined,
      confirmedAt: order.confirmedAt || undefined,
      escrowReleaseAt: order.escrowReleaseAt || undefined,
      productTitle: order.product?.title,
      productImage: order.product?.imageUrls?.[0],
      buyerName: order.buyer?.email?.split('@')[0],
      sellerName: order.seller?.email?.split('@')[0],
    };
  }


  /**
   * Get seller's physical orders (for dashboard)
   */
  async getSellerPhysicalOrders(
    sellerId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const [orders, total] = await this.orderRepo.findAndCount({
      where: {
        seller: { id: sellerId },
        product: { listingType: ListingType.PHYSICAL },
      },
      relations: ['product', 'buyer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: orders.map((o) => this.getOrderStatus(o)),
      total,
      page,
      limit,
    };
  }

  /**
   * Get buyer's physical orders (for my purchases)
   */
  async getBuyerPhysicalOrders(
    buyerId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const [orders, total] = await this.orderRepo.findAndCount({
      where: {
        buyer: { id: buyerId },
        product: { listingType: ListingType.PHYSICAL },
      },
      relations: ['product', 'seller'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: orders.map((o) => this.getOrderStatus(o)),
      total,
      page,
      limit,
    };
  }
}
