import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, SellerStatus } from '../../user/entities/user.entity';
import { SeekerProfile } from '../../user/entities/seeker-profile.entity';

function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

@Injectable()
export class SellersModerationService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(SeekerProfile)
    private readonly seekerProfileRepo: Repository<SeekerProfile>,
  ) {}

  async getPendingSellerApplications(page = 1, limit = 20) {
    const [data, total] = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.seekerProfile', 'seekerProfile')
      .select([
        'user.id',
        'user.email',
        'user.sellerStatus',
        'user.createdAt',
        'seekerProfile.id',
        'seekerProfile.firstName',
        'seekerProfile.lastName',
        'seekerProfile.avatarUrl',
      ])
      .where('user.sellerStatus = :status', { status: SellerStatus.PENDING })
      .orderBy('user.createdAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: toPlain(data), meta: { page, limit, total } };
  }

  async approveSeller(userId: string): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['seekerProfile'],
    });

    if (!user) throw new NotFoundException('User not found');
    if (user.sellerStatus !== SellerStatus.PENDING) {
      throw new BadRequestException(
        'Only pending seller applications can be approved',
      );
    }

    await this.userRepo.update(
      { id: userId },
      { sellerStatus: SellerStatus.APPROVED },
    );

    // TODO: Send approval email
    // TODO: Create notification
  }

  async rejectSeller(userId: string, reason?: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepo.update(
      { id: userId },
      { sellerStatus: SellerStatus.REJECTED },
    );

    // TODO: Send rejection email with reason
    // TODO: Create notification
  }

  async getActiveSellerApplications(page = 1, limit = 20) {
    const [data, total] = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.seekerProfile', 'seekerProfile')
      .select([
        'user.id',
        'user.email',
        'user.sellerStatus',
        'user.createdAt',
        'seekerProfile.id',
        'seekerProfile.firstName',
        'seekerProfile.lastName',
        'seekerProfile.avatarUrl',
      ])
      .where('user.sellerStatus = :status', { status: SellerStatus.APPROVED })
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: toPlain(data), meta: { page, limit, total } };
  }
}
