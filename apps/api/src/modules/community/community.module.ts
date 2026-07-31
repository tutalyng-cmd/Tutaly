import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { CommunityBowl } from './entities/community-bowl.entity';
import { CommunityThread } from './entities/community-thread.entity';
import { CommunityComment } from './entities/community-comment.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommunityBowl, CommunityThread, CommunityComment]),
    UserModule,
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
