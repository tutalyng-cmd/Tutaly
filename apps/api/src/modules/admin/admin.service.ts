import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, SellerStatus } from '../user/entities/user.entity';
import { Job, JobStatus } from '../job/entities/job.entity';
import { Order, OrderStatus, PaymentGateway, OrderDispute, DisputeStatus } from '../shop/entities/order.entity';
import { ListingType } from '../shop/entities/shop.entity';
import {
  SellerApplication,
  SellerApplicationStatus,
} from '../support/entities/support.entity';
import { ShopProduct } from '../shop/entities/shop.entity';
import { CompanyReview, ReviewStatus } from '../review/entities/review.entity';

/**
 * Strips TypeORM entity metadata & circular references by
 * round-tripping through JSON. Safe because all our entities
 * contain only serialisable primitives, dates, and arrays.
 */
function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Job) private readonly jobRepo: Repository<Job>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(SellerApplication)
    private readonly sellerAppRepo: Repository<SellerApplication>,
    @InjectRepository(ShopProduct)
    private readonly productRepo: Repository<ShopProduct>,
    @InjectRepository(OrderDispute)
    private readonly disputeRepo: Repository<OrderDispute>,
    @InjectRepository(CompanyReview)
    private readonly reviewRepo: Repository<CompanyReview>,
  ) {}

  async getDashboardStats() {
    const totalUsers = await this.userRepo.count();
    const activeJobs = await this.jobRepo.count({
      where: { status: JobStatus.ACTIVE },
    });

    // Calculate total revenue and commission (only completed or paid orders)
    const orders = await this.orderRepo
      .createQueryBuilder('order')
      .where('order.status IN (:...statuses)', {
        statuses: [
          OrderStatus.COMPLETED,
          OrderStatus.PAID,
          OrderStatus.DELIVERED,
        ],
      })
      .select('SUM(order.amountPaid)', 'totalRevenue')
      .addSelect('SUM(order.commissionAmount)', 'totalCommission')
      .getRawOne();

    const pendingJobsCount = await this.jobRepo.count({
      where: { status: JobStatus.PENDING_REVIEW },
    });
    const pendingSellersCount = await this.sellerAppRepo.count({
      where: { status: SellerApplicationStatus.PENDING },
    });
    const flaggedOrdersCount = await this.orderRepo.count({
      where: { status: OrderStatus.FLAGGED },
    });
    const totalProducts = await this.productRepo.count();
    const openDisputesCount = await this.disputeRepo.count({
      where: { status: DisputeStatus.OPEN },
    });

    return {
      totalUsers,
      activeJobs,
      totalRevenue: Number(orders?.totalRevenue || 0),
      totalCommission: Number(orders?.totalCommission || 0),
      pendingJobsCount,
      pendingSellersCount,
      flaggedOrdersCount,
      totalProducts,
      openDisputesCount,
    };
  }

  async getUsers(page = 1, limit = 20) {
    const [users, total] = await this.userRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items: users.map((u) => {
        const { password: _password, ...rest } = u; // Ensure password is removed
        return rest;
      }),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent admins from deactivating themselves
    if (user.role === UserRole.ADMIN) {
      throw new Error('Cannot deactivate an admin user');
    }

    user.isActive = isActive;
    await this.userRepo.save(user);

    return {
      success: true,
      message: `User status updated to ${isActive ? 'active' : 'inactive'}`,
    };
  }

  async getPendingJobs(page = 1, limit = 20) {
    const [jobs, total] = await this.jobRepo.findAndCount({
      where: { status: JobStatus.PENDING_REVIEW },
      relations: ['employer'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items: toPlain(jobs),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllJobs(page = 1, limit = 20, status?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [jobs, total] = await this.jobRepo.findAndCount({
      where,
      relations: ['employer'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items: toPlain(jobs),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllSellerApplications(page = 1, limit = 20, status?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.sellerAppRepo.findAndCount({
      where,
      relations: ['user', 'reviewedBy'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items: toPlain(data),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateSellerApplication(
    applicationId: string,
    status: SellerApplicationStatus,
    adminId: string,
  ) {
    const application = await this.sellerAppRepo.findOne({
      where: { id: applicationId },
      relations: ['user'],
    });
    if (!application) throw new NotFoundException('Application not found');

    application.status = status;
    application.reviewedBy = { id: adminId } as any;
    await this.sellerAppRepo.save(application);

    // Update user's sellerStatus
    const user = application.user;
    if (status === SellerApplicationStatus.APPROVED) {
      user.sellerStatus = SellerStatus.APPROVED;
    } else if (status === SellerApplicationStatus.REJECTED) {
      user.sellerStatus = SellerStatus.REJECTED;
    }
    await this.userRepo.save(user);

    return { success: true, message: `Seller application ${status}.` };
  }

  async getFlaggedOrders(page = 1, limit = 20) {
    const [orders, total] = await this.orderRepo.findAndCount({
      where: { status: OrderStatus.FLAGGED },
      relations: ['buyer', 'seller', 'product'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items: toPlain(orders),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async resolveFlaggedOrder(
    orderId: string,
    resolution: 'completed' | 'refunded',
    adminNotes?: string,
  ) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.FLAGGED) {
      throw new Error('Order is not in a flagged state');
    }

    if (resolution === 'completed') {
      order.status = OrderStatus.COMPLETED;
      order.earningsReleasedAt = new Date();
    } else if (resolution === 'refunded') {
      order.status = OrderStatus.REFUNDED;
      order.escrowReleaseAt = null;
      // Note: Real integration would trigger a payment gateway refund here
    }

    if (adminNotes) {
      order.adminNotes = adminNotes;
    }

    await this.orderRepo.save(order);

    return {
      success: true,
      message: `Order successfully resolved as ${resolution}`,
    };
  }

  async getAllProducts(page = 1, limit = 20, isActive?: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const [products, total] = await this.productRepo.findAndCount({
      where,
      relations: ['seller', 'subcategory', 'subcategory.category'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items: toPlain(products),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllOrders(page = 1, limit = 20, status?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [orders, total] = await this.orderRepo.findAndCount({
      where,
      relations: ['buyer', 'seller', 'product'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items: toPlain(orders),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Verify Payment with Gateway ────────────────────────────────

  async verifyPaymentWithGateway(orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['product'],
    });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException(
        `Order is already ${order.status} — verification only applies to pending_payment orders`,
      );
    }

    if (order.paymentGateway !== PaymentGateway.PAYSTACK) {
      throw new BadRequestException(
        `Verification is only supported for Paystack orders. This order uses ${order.paymentGateway}.`,
      );
    }

    if (!order.paymentRef) {
      throw new BadRequestException('Order has no payment reference to verify.');
    }

    // Call Paystack Verify Transaction API
    const secret = process.env.PAYSTACK_SECRET_KEY || '';
    if (!secret) {
      throw new BadRequestException('PAYSTACK_SECRET_KEY is not configured.');
    }

    try {
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${order.paymentRef}`,
        {
          headers: {
            Authorization: `Bearer ${secret}`,
          },
        },
      );
      const result = await response.json();

      if (result.status === true && result.data?.status === 'success') {
        // Payment was successful — update order
        if (order.product?.listingType === ListingType.DIGITAL) {
          order.status = OrderStatus.COMPLETED;
          order.earningsReleasedAt = new Date();
        } else {
          order.status = OrderStatus.PAID;
        }
        order.adminNotes = `Payment verified by admin via Paystack API. Gateway ref: ${result.data.reference}`;
        await this.orderRepo.save(order);

        this.logger.log(`Order ${orderId} payment verified and updated to ${order.status}`);

        return {
          success: true,
          verified: true,
          newStatus: order.status,
          message: `Payment confirmed by Paystack. Order updated to ${order.status}.`,
          gatewayData: {
            amount: result.data.amount / 100,
            currency: result.data.currency,
            paidAt: result.data.paid_at,
            channel: result.data.channel,
          },
        };
      } else {
        // Payment not successful on Paystack side
        return {
          success: true,
          verified: false,
          message: `Paystack reports this payment as "${result.data?.status || 'unknown'}". No changes made.`,
          gatewayStatus: result.data?.status || 'unknown',
        };
      }
    } catch (error) {
      this.logger.error(`Failed to verify payment for order ${orderId}:`, error);
      throw new BadRequestException(
        'Failed to reach Paystack API. Please try again.',
      );
    }
  }

  // ─── Cancel Order ───────────────────────────────────────────────

  async cancelOrder(orderId: string, adminNotes?: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.REFUNDED) {
      throw new BadRequestException(
        `Cannot cancel an order that is already ${order.status}.`,
      );
    }

    order.status = OrderStatus.REFUNDED;
    order.adminNotes = adminNotes
      ? `[Admin cancelled] ${adminNotes}`
      : '[Admin cancelled] Order cancelled by admin.';
    await this.orderRepo.save(order);

    this.logger.log(`Order ${orderId} cancelled by admin`);

    return {
      success: true,
      message: 'Order has been cancelled and marked as refunded.',
    };
  }

  // ─── Flag Order ─────────────────────────────────────────────────

  async flagOrder(orderId: string, adminNotes?: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.REFUNDED) {
      throw new BadRequestException(
        `Cannot flag an order that is already ${order.status}.`,
      );
    }

    if (order.status === OrderStatus.FLAGGED) {
      throw new BadRequestException('Order is already flagged.');
    }

    order.status = OrderStatus.FLAGGED;
    order.adminNotes = adminNotes
      ? `[Admin flagged] ${adminNotes}`
      : '[Admin flagged] Order flagged for review by admin.';
    await this.orderRepo.save(order);

    this.logger.log(`Order ${orderId} flagged by admin`);

    return {
      success: true,
      message: 'Order has been flagged for review.',
    };
  }
  // ─── Disputes ────────────────────────────────────────────────────────

  async getDisputes(page = 1, limit = 10, status?: DisputeStatus) {
    const query = this.disputeRepo
      .createQueryBuilder('dispute')
      .leftJoinAndSelect('dispute.order', 'order')
      .leftJoinAndSelect('dispute.raisedBy', 'raisedBy')
      .leftJoinAndSelect('dispute.resolvedBy', 'resolvedBy')
      .orderBy('dispute.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      query.andWhere('dispute.status = :status', { status });
    }

    const [data, total] = await query.getManyAndCount();
    return { data: toPlain(data), meta: { page, limit, total } };
  }

  async resolveDispute(disputeId: string, adminId: string, dto: any) {
    const dispute = await this.disputeRepo.findOne({
      where: { id: disputeId },
      relations: ['order'],
    });

    if (!dispute) throw new NotFoundException('Dispute not found');
    if (dispute.status !== DisputeStatus.OPEN) {
      throw new BadRequestException(`Dispute is already ${dispute.status}`);
    }

    dispute.status = dto.status;
    dispute.resolutionNotes = dto.resolutionNotes;
    dispute.resolvedBy = { id: adminId } as User;
    dispute.resolvedAt = new Date();

    const order = await this.orderRepo.findOne({ where: { id: dispute.order.id } });
    if (!order) throw new NotFoundException('Order associated with dispute not found');

    if (dto.status === DisputeStatus.RESOLVED_REFUND) {
      order.status = OrderStatus.REFUNDED;
      // You would typically trigger a refund via Flutterwave/Paystack API here
      this.logger.log(`Admin ${adminId} ordered REFUND for order ${order.id} via dispute ${disputeId}`);
    } else if (dto.status === DisputeStatus.RESOLVED_RELEASE) {
      order.status = OrderStatus.COMPLETED;
      order.earningsReleasedAt = new Date();
      this.logger.log(`Admin ${adminId} ordered RELEASE for order ${order.id} via dispute ${disputeId}`);
    }

    await this.orderRepo.save(order);
    await this.disputeRepo.save(dispute);

    return { success: true, message: `Dispute resolved as ${dto.status}`, data: toPlain(dispute) };
  }

  // ─── Review Moderation ──────────────────────────────────────────────

  async getPendingReviews(page = 1, limit = 20) {
    const [data, total] = await this.reviewRepo.findAndCount({
      where: { status: ReviewStatus.PENDING },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: toPlain(data), meta: { page, limit, total } };
  }

  async approveReview(reviewId: string) {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.status !== ReviewStatus.PENDING) {
      throw new BadRequestException(`Review is already ${review.status}`);
    }
    review.status = ReviewStatus.APPROVED;
    await this.reviewRepo.save(review);
    return { success: true, message: 'Review approved.' };
  }

  async rejectReview(reviewId: string) {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.status !== ReviewStatus.PENDING) {
      throw new BadRequestException(`Review is already ${review.status}`);
    }
    review.status = ReviewStatus.REJECTED;
    await this.reviewRepo.save(review);
    return { success: true, message: 'Review rejected.' };
  }
}
