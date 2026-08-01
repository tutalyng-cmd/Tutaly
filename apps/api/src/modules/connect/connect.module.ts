import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectController } from './connect.controller';
import { ConnectService } from './connect.service';
import { ImageListener } from './image.listener';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { PostComment } from './entities/post-comment.entity';
import { Follow } from './entities/follow.entity';
import { Message } from './entities/message.entity';
import { Report } from './entities/report.entity';
import { SavedPost as PostSave } from './entities/saved-post.entity';
import { PostShare } from './entities/post-share.entity';
import { PostMedia } from './entities/post-media.entity';
import { CommentLike } from './entities/comment-like.entity';
import { ConnectNotification } from './entities/connect-notification.entity';
import { Block } from './entities/block.entity';
import { User } from '../user/entities/user.entity';
import { SupportModule } from '../support/support.module';
import { AuthModule } from '../auth/auth.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      PostLike,
      PostComment,
      Follow,
      Message,
      Report,
      User,
      PostSave,
      PostShare,
      PostMedia,
      CommentLike,
      ConnectNotification,
      Block,
    ]),
    SupportModule,
    AuthModule,
  ],
  controllers: [ConnectController],
  providers: [ConnectService, ImageListener, ChatGateway],
  exports: [ConnectService],
})
export class ConnectModule {}
