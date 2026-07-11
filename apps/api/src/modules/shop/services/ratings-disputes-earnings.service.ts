import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { ShopProduct } from '../entities/shop.entity';
import { ProductRating } from '../entities/product-rating.entity';
import {
  QuoteRequest,
  OrderDispute,
  DisputeStatus,
} from '../entities/order.entity';
import { User } from '../../user/entities/user.entity';
import {
  RateProductDto,
  CreateDisputeDto,
  ResolveDisputeDto,
  SellerEarningsSummaryDto,
  SellerSaleDto,
  OrderContactDto,
} from '../dto/ratings-disputes-earnings.dto';

/**
 * RatingsDisputesEarnings Service
 * Handles product ratings, order disputes, and seller earnings dashboard
 */
@Injectable()
export class RatingsDisputesEarningsService {
  private readonly logger = new Logger(RatingsDisputesEarningsService.name);

  constructor(
    @InjectRepository(ProductRating)
    private readonly ratingRepo: Repository<ProductRating>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(ShopProduct)
    private readonly productRepo: Repository<ShopProduct>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(QuoteRequest)
    private readonly quoteRepo: Repository<QuoteRequest>,
    @InjectRepository(OrderDispute)
    private readonly disputeRepo: Repository<OrderDispute>,
  ) {}

  // ─── PRODUCT RATINGS ────────────────────────────────────────────

  /**
   * Rate a product (buyer only, verified purchase required)
   */
  async rateProduct(
    productId: string,
    buyerId: string,
    dto: RateProductDto,
  ): Promise<ProductRating> {
    // Verify product exists
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify buyer has completed an order for this product
    const completedOrder = await this.orderRepo.findOne({
      where: {
        product: { id: productId },
        buyer: { id: buyerId },
        status: OrderStatus.COMPLETED,
      },
    });

    if (!completedOrder) {
      throw new ForbiddenException(
        'You must have a completed order for this product to rate it',
      );
    }

    // Check if rating already exists
    const existingRating = await this.ratingRepo.findOne({
      where: {
        product: { id: productId },
        buyer: { id: buyerId },
      },
    });

    if (existingRating) {
      throw new BadRequestException('You have already rated this product');
    }

    // Create rating
    const productRef = new ShopProduct();
    productRef.id = productId;
    const buyerRef = new User();
    buyerRef.id = buyerId;

    const rating = this.ratingRepo.create({
      product: productRef,
      buyer: buyerRef,
      rating: dto.rating,
      comment: dto.comment,
      isVerifiedPurchase: true,
      orderId: completedOrder.id,
    });

    const savedRating = await this.ratingRepo.save(rating);

    // Recalculate product aggregate rating
    await this.recalculateProductRating(productId);

    this.logger.log(
      `Product ${productId} rated ${dto.rating} stars by buyer ${buyerId}`,
    );

    return savedRating;
  }

  /**
   * Get ratings for a product
   */
  async getProductRatings(
    productId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const [ratings, total] = await this.ratingRepo.findAndCount({
      where: { product: { id: productId } },
      relations: ['buyer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: ratings.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        buyerUsername: r.buyer?.email?.split('@')[0] || 'Anonymous',
        createdAt: r.createdAt,
      })),
      total,
      page,
      limit,
    };
  }

  /**
   * Recalculate aggregate rating for a product
   */
  private async recalculateProductRating(productId: string): Promise<void> {
    const ratings = await this.ratingRepo.find({
      where: { product: { id: productId } },
    });

    if (ratings.length === 0) {
      // Reset product rating
      await this.productRepo.update({ id: productId }, {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: {},
      } as Partial<ShopProduct>);
      return;
    }

    // Calculate statistics
    const totalRatings = ratings.length;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = Number((sum / totalRatings).toFixed(2));

    const distribution = {
      1: ratings.filter((r) => r.rating === 1).length,
      2: ratings.filter((r) => r.rating === 2).length,
      3: ratings.filter((r) => r.rating === 3).length,
      4: ratings.filter((r) => r.rating === 4).length,
      5: ratings.filter((r) => r.rating === 5).length,
    };

    // Update product with aggregated data
    await this.productRepo.update({ id: productId }, {
      averageRating,
      totalRatings,
      ratingDistribution: distribution,
    } as Partial<ShopProduct>);

    this.logger.debug(
      `Recalculated rating for product ${productId}: ${averageRating} (${totalRatings} ratings)`,
    );
  }

  // ─── ORDER DISPUTES ────────────────────────────────────────────

  /**
   * Buyer raises a dispute (within 48 hours of order completion)
   */
  async createDispute(
    orderId: string,
    buyerId: string,
    dto: CreateDisputeDto,
  ): Promise<OrderDispute> {
    // Verify order exists and buyer is the one raising dispute
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['buyer', 'seller'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.buyer.id !== buyerId) {
      throw new ForbiddenException('Only the buyer can raise a dispute');
    }

    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException(
        'Disputes can only be raised for completed orders',
      );
    }

    // Check 48-hour window
    if (order.deliveryConfirmedAt) {
      const hoursSinceCompletion =
        (Date.now() - order.deliveryConfirmedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCompletion > 48) {
        throw new BadRequestException(
          'Disputes can only be raised within 48 hours of order completion',
        );
      }
    }

    // Check for existing dispute
    const existingDispute = await this.disputeRepo.findOne({
      where: { order: { id: orderId } },
    });

    if (existingDispute) {
      throw new BadRequestException('A dispute already exists for this order');
    }

    // Create dispute
    const orderRef = new Order();
    orderRef.id = orderId;
    const raisedByRef = new User();
    raisedByRef.id = buyerId;

    const dispute = this.disputeRepo.create({
      order: orderRef,
      raisedBy: raisedByRef,
      reason: dto.reason,
      evidenceUrls: dto.evidenceUrls,
      status: DisputeStatus.OPEN,
    });

    const savedDispute = await this.disputeRepo.save(dispute);

    // Flag order for admin review
    await this.orderRepo.update(
      { id: orderId },
      { status: OrderStatus.FLAGGED },
    );

    // TODO: Notify seller via SendGrid

    this.logger.log(`Dispute created for order ${orderId} by buyer ${buyerId}`);

    return savedDispute;
  }

  /**
   * Admin resolves a dispute
   */
  async resolveDispute(
    disputeId: string,
    adminId: string,
    dto: ResolveDisputeDto,
  ): Promise<OrderDispute> {
    const dispute = await this.disputeRepo.findOne({
      where: { id: disputeId },
      relations: ['order', 'order.buyer', 'order.seller'],
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (dispute.status !== DisputeStatus.OPEN) {
      throw new BadRequestException('Dispute is already resolved');
    }

    const order = dispute.order;

    if (dto.decision === 'refund') {
      // Initiate refund to buyer
      await this.initiateRefund(order, adminId);
      dispute.status = DisputeStatus.RESOLVED_REFUND;
    } else if (dto.decision === 'release') {
      // Release seller earnings
      await this.releaseSellerEarnings(order);
      dispute.status = DisputeStatus.RESOLVED_RELEASE;
    }

    dispute.resolutionNotes = dto.resolutionNotes;
    const adminRef = new User();
    adminRef.id = adminId;
    dispute.resolvedBy = adminRef;
    dispute.resolvedAt = new Date();

    const savedDispute = await this.disputeRepo.save(dispute);

    // TODO: Notify buyer and seller via SendGrid

    this.logger.log(
      `Dispute ${disputeId} resolved with decision: ${dto.decision}`,
    );

    return savedDispute;
  }

  /**
   * Initiate refund to buyer (calls payment gateway)
   */
  private async initiateRefund(order: Order, adminId: string): Promise<void> {
    // TODO: Call payment gateway refund API
    // - Paystack: POST /refund
    // - Flutterwave: POST /refunds

    order.status = OrderStatus.REFUNDED;
    await this.orderRepo.save(order);

    this.logger.log(
      `Refund initiated for order ${order.id} by admin ${adminId}`,
    );
  }

  /**
   * Release seller earnings from escrow
   */
  private async releaseSellerEarnings(order: Order): Promise<void> {
    order.earningsReleasedAt = new Date();
    order.status = OrderStatus.COMPLETED;
    await this.orderRepo.save(order);

    this.logger.log(`Seller earnings released for order ${order.id}`);
  }

  /**
   * Get all disputes for admin
   */
  async getDisputesForAdmin(
    page: number = 1,
    limit: number = 10,
    status?: DisputeStatus,
  ) {
    const query = this.disputeRepo
      .createQueryBuilder('dispute')
      .leftJoinAndSelect('dispute.order', 'order')
      .leftJoinAndSelect('dispute.raisedBy', 'buyer')
      .leftJoinAndSelect('dispute.resolvedBy', 'admin')
      .orderBy('dispute.createdAt', 'DESC');

    if (status) {
      query.where('dispute.status = :status', { status });
    }

    const [disputes, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: disputes,
      total,
      page,
      limit,
    };
  }

  // ─── SELLER EARNINGS DASHBOARD ──────────────────────────────────

  /**
   * Get seller's completed sales (paginated)
   */
  async getSellerSales(
    sellerId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    items: SellerSaleDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [orders, total] = await this.orderRepo.findAndCount({
      where: {
        seller: { id: sellerId },
        status: OrderStatus.COMPLETED,
      },
      relations: ['product', 'buyer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items: SellerSaleDto[] = orders.map((order) => ({
      id: order.id,
      productTitle: order.product.title,
      buyerUsername: order.buyer.email.split('@')[0],
      amount: Number(order.amountPaid),
      commissionDeducted: Number(order.commissionAmount),
      sellerEarnings: Number(order.sellerEarnings),
      currency: order.currency,
      status: order.status,
      completedAt: order.deliveredAt || order.updatedAt,
    }));

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Get seller's earnings summary
   */
  async getSellerEarningsSummary(
    sellerId: string,
  ): Promise<SellerEarningsSummaryDto> {
    const orders = await this.orderRepo.find({
      where: {
        seller: { id: sellerId },
        status: OrderStatus.COMPLETED,
      },
    });

    const totalGrossSales = orders.reduce(
      (sum, o) => sum + Number(o.amountPaid),
      0,
    );
    const totalCommissionPaid = orders.reduce(
      (sum, o) => sum + Number(o.commissionAmount),
      0,
    );
    const totalNetEarnings = orders.reduce(
      (sum, o) => sum + Number(o.sellerEarnings),
      0,
    );

    // TODO: Calculate pending amount (not yet released)
    const pendingAmount = 0;

    return {
      totalGrossSales: Number(totalGrossSales.toFixed(2)),
      totalCommissionPaid: Number(totalCommissionPaid.toFixed(2)),
      totalNetEarnings: Number(totalNetEarnings.toFixed(2)),
      pendingAmount,
      currency: 'NGN', // TODO: Handle multi-currency
      period: {
        startDate: new Date('2026-01-01'),
        endDate: new Date(),
      },
    };
  }

  // ─── PHYSICAL PRODUCT CONTACT REVEAL ────────────────────────────

  /**
   * Get seller contact info for completed order
   * Only accessible by the buyer
   */
  async getOrderContact(
    orderId: string,
    requestingUserId: string,
  ): Promise<OrderContactDto> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['buyer', 'seller', 'seller.seekerProfile', 'product'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify requester is the buyer
    if (order.buyer.id !== requestingUserId) {
      throw new ForbiddenException(
        'Only the buyer can view seller contact information',
      );
    }

    // Verify order is completed
    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException(
        'Contact information is only available for completed orders',
      );
    }

    const seller = order.seller;
    const firstName = seller.seekerProfile?.firstName || '';
    const lastName = seller.seekerProfile?.lastName || '';
    const sellerName = (firstName + ' ' + lastName).trim() || seller.email;

    return {
      sellerName,
      sellerUsername: seller.email.split('@')[0],
      contactPhone: seller.contactPhone,
      whatsappPhone: seller.whatsappPhone,
      email: seller.email,
    };
  }

  // ─── ADMIN REVENUE REPORTING ───────────────────────────────────

  /**
   * Get revenue report for admin (all commissions)
   */
  async getAdminRevenueReport(
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, unknown>> {
    const orders = await this.orderRepo.find({
      where: {
        status: OrderStatus.COMPLETED,
        createdAt: Between(startDate, endDate),
      },
      relations: ['product'],
    });

    if (orders.length === 0) {
      return {
        totalTransactions: 0,
        totalGrossVolume: 0,
        totalCommissionsEarned: 0,
        byGateway: {},
        byCurrency: {},
        period: { startDate, endDate },
      };
    }

    const byGateway: Record<
      string,
      { volume: number; commission: number; transactionCount: number }
    > = {};
    const byCurrency: Record<string, { volume: number; commission: number }> =
      {};
    let totalGross = 0;
    let totalCommission = 0;

    for (const order of orders) {
      const gateway = order.paymentGateway;
      const currency = order.currency;

      // By gateway
      if (!byGateway[gateway]) {
        byGateway[gateway] = {
          volume: 0,
          commission: 0,
          transactionCount: 0,
        };
      }
      byGateway[gateway].volume += Number(order.amountPaid);
      byGateway[gateway].commission += Number(order.commissionAmount);
      byGateway[gateway].transactionCount += 1;

      // By currency
      if (!byCurrency[currency]) {
        byCurrency[currency] = { volume: 0, commission: 0 };
      }
      byCurrency[currency].volume += Number(order.amountPaid);
      byCurrency[currency].commission += Number(order.commissionAmount);

      totalGross += Number(order.amountPaid);
      totalCommission += Number(order.commissionAmount);
    }

    return {
      totalTransactions: orders.length,
      totalGrossVolume: Number(totalGross.toFixed(2)),
      totalCommissionsEarned: Number(totalCommission.toFixed(2)),
      byGateway,
      byCurrency,
      period: { startDate, endDate },
    };
  }
}
