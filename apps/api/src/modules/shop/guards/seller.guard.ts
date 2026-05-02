import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, SellerStatus } from '../../user/entities/user.entity';

@Injectable()
export class SellerGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;

    if (!userId) {
      throw new ForbiddenException('Authentication required.');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || user.sellerStatus !== SellerStatus.APPROVED) {
      throw new ForbiddenException('You must be an approved seller to perform this action. Apply at /shop/seller/apply.');
    }

    return true;
  }
}
