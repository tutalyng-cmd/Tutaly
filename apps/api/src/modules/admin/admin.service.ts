import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../user/entities/user.entity';
import { Job, JobStatus } from '../job/entities/job.entity';
import { Order, OrderStatus } from '../shop/entities/order.entity';
import {
  SellerApplication,
  SellerApplicationStatus,
} from '../support/entities/support.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Job) private readonly jobRepo: Repository<Job>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(SellerApplication)
    private readonly sellerAppRepo: Repository<SellerApplication>,
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

    return {
      totalUsers,
      activeJobs,
      totalRevenue: Number(orders?.totalRevenue || 0),
      totalCommission: Number(orders?.totalCommission || 0),
      pendingJobsCount,
      pendingSellersCount,
      flaggedOrdersCount,
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
      items: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllJobs(page = 1, limit = 20, status?: string) {
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
      items: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllSellerApplications(page = 1, limit = 20, status?: string) {
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
      items: data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
      items: orders,
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
}
