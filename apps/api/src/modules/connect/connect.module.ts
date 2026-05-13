import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConnectController } from './connect.controller';
import { ConnectService } from './connect.service';
import { FeedProcessor } from './feed.processor';
import { Post, PostLike, PostComment, Follow, Message, Report } from './entities/connect.entity';
import { User } from '../user/entities/user.entity';
import { SupportModule } from '../support/support.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostLike, PostComment, Follow, Message, Report, User]),
    BullModule.registerQueue({
      name: 'feed-fanout',
    }),
    SupportModule,
    AuthModule,
  ],
  controllers: [ConnectController],
  providers: [ConnectService, FeedProcessor],
  exports: [ConnectService],
})
export class ConnectModule {}
