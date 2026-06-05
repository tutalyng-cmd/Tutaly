import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, SellerStatus } from '../../user/entities/user.entity';
import { SeekerProfile } from '../../user/entities/seeker-profile.entity';
import { EmployerProfile } from '../../user/entities/employer-profile.entity';
import { Post } from '../../connect/entities/post.entity';
import { Job } from '../../job/entities/job.entity';

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(SeekerProfile)
    private readonly seekerProfileRepo: Repository<SeekerProfile>,
    @InjectRepository(EmployerProfile)
    private readonly employerProfileRepo: Repository<EmployerProfile>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Job) private readonly jobRepo: Repository<Job>,
  ) {}

  async getUsers(
    page = 1,
    limit = 20,
    search?: string,
    role?: UserRole,
    status?: UserStatus,
  ) {
    let query = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.seekerProfile', 'seekerProfile')
      .leftJoinAndSelect('user.employerProfile', 'employerProfile');

    if (search) {
      query = query.where(
        '(user.email ILIKE :search OR user.username ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (role) {
      query = query.andWhere('user.role = :role', { role });
    }

    if (status) {
      if (status === UserStatus.ACTIVE) {
        query = query.andWhere('user.isActive = true');
      } else if (status === UserStatus.SUSPENDED) {
        query = query.andWhere('user.isSuspended = true');
      } else if (status === UserStatus.DELETED) {
        query = query.andWhere('user.isDeleted = true');
      }
    }

    const [data, total] = await query
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: toPlain(data),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUserDetail(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['seekerProfile', 'employerProfile'],
    });

    if (!user) throw new NotFoundException('User not found');

    // Get associated counts
    const postCount = await this.postRepo.count({
      where: { author: { id: userId } },
    });
    const jobCount = await this.jobRepo.count({
      where: { employer: { id: userId } },
    });

    return toPlain({
      ...user,
      postCount,
      jobCount,
    });
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (status === UserStatus.SUSPENDED) {
      await this.userRepo.update({ id: userId }, { isSuspended: true });
      // TODO: Send suspension email
    } else if (status === UserStatus.ACTIVE) {
      await this.userRepo.update(
        { id: userId },
        { isSuspended: false, isActive: true },
      );
    } else if (status === UserStatus.DELETED) {
      // Soft delete with anonymization
      await this.userRepo.update(
        { id: userId },
        {
          isDeleted: true,
          email: `deleted_${userId}@deleted.local`, // Anonymize email
        },
      );

      // Anonymize seeker profile
      if (user.role === UserRole.SEEKER) {
        const seekerProfile = await this.seekerProfileRepo.findOne({
          where: { user: { id: userId } },
        });
        if (seekerProfile) {
          await this.seekerProfileRepo.update(
            { id: seekerProfile.id },
            {
              firstName: 'Deleted',
              lastName: 'User',
              avatarUrl: undefined,
            },
          );
        }
      }

      // Anonymize employer profile
      if (user.role === UserRole.EMPLOYER) {
        const employerProfile = await this.employerProfileRepo.findOne({
          where: { user: { id: userId } },
        });
        if (employerProfile) {
          await this.employerProfileRepo.update(
            { id: employerProfile.id },
            {
              companyName: 'Deleted Company',
              logoUrl: undefined,
            },
          );
        }
      }

      // Remove all seller listings if applicable
      if (user.sellerStatus !== SellerStatus.NONE) {
        await this.postRepo.delete({ author: { id: userId } });
      }

      // Remove all posted jobs if employer
      if (user.role === UserRole.EMPLOYER) {
        await this.jobRepo.delete({ employer: { id: userId } });
      }
    }
  }

  async bulkUpdateUserStatus(
    userIds: string[],
    status: UserStatus,
  ): Promise<void> {
    for (const userId of userIds) {
      await this.updateUserStatus(userId, status);
    }
  }
}
