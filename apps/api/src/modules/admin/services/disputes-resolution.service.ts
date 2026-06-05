import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  OrderDispute,
  Order,
  OrderStatus,
  DisputeStatus,
} from '../../shop/entities/order.entity';
import { User } from '../../user/entities/user.entity';

function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export enum DisputeResolution {
  REFUND_BUYER = 'resolved_refund',
  RELEASE_TO_SELLER = 'resolved_release',
}

@Injectable()
export class DisputesResolutionService {
  constructor(
    @InjectRepository(OrderDispute)
    private readonly disputeRepo: Repository<OrderDispute>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getOpenDisputes(page = 1, limit = 20) {
    const [data, total] = await this.disputeRepo
      .createQueryBuilder('dispute')
      .leftJoinAndSelect('dispute.order', 'order')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.seller', 'seller')
      .leftJoinAndSelect('order.product', 'product')
      .where('dispute.status = :status', { status: DisputeStatus.OPEN })
      .orderBy('dispute.createdAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: toPlain(data),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async resolveDispute(
    disputeId: string,
    resolution: DisputeResolution,
    resolutionNotes: string,
    adminId: string,
  ): Promise<void> {
    const dispute = await this.disputeRepo.findOne({
      where: { id: disputeId },
      relations: ['order'],
    });

    if (!dispute) throw new NotFoundException('Dispute not found');
    if (dispute.status !== DisputeStatus.OPEN) {
      throw new BadRequestException('Only open disputes can be resolved');
    }

    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    // Update dispute with resolution-specific status
    let newDisputeStatus: DisputeStatus;
    if (resolution === DisputeResolution.REFUND_BUYER) {
      newDisputeStatus = DisputeStatus.RESOLVED_REFUND;
    } else if (resolution === DisputeResolution.RELEASE_TO_SELLER) {
      newDisputeStatus = DisputeStatus.RESOLVED_RELEASE;
    } else {
      throw new BadRequestException('Invalid resolution type');
    }

    await this.disputeRepo.update(
      { id: disputeId },
      {
        status: newDisputeStatus,
        resolutionNotes,
        resolvedAt: new Date(),
        resolvedBy: admin,
      },
    );

    // Trigger payment action based on resolution
    if (resolution === DisputeResolution.REFUND_BUYER) {
      // TODO: Process refund to buyer
      // TODO: Deduct from seller earnings
      // TODO: Create refund transaction
      await this.orderRepo.update(
        { id: dispute.order.id },
        {
          status: OrderStatus.REFUNDED,
        },
      );
    } else if (resolution === DisputeResolution.RELEASE_TO_SELLER) {
      // TODO: Release earnings to seller
      // TODO: Create earnings transaction
      await this.orderRepo.update(
        { id: dispute.order.id },
        {
          status: OrderStatus.CONFIRMED,
        },
      );
    }

    // TODO: Notify both buyer and seller of resolution
  }

  async getResolvedDisputes(page = 1, limit = 20) {
    const [data, total] = await this.disputeRepo
      .createQueryBuilder('dispute')
      .leftJoinAndSelect('dispute.order', 'order')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.seller', 'seller')
      .where('dispute.status IN (:...statuses)', {
        statuses: [
          DisputeStatus.RESOLVED_REFUND,
          DisputeStatus.RESOLVED_RELEASE,
        ],
      })
      .orderBy('dispute.resolvedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: toPlain(data), meta: { page, limit, total } };
  }
}
