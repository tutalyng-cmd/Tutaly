import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import Redis from 'ioredis';
import { User } from '../user/entities/user.entity';
import { Post, PostLike, PostComment, Follow, FollowStatus, Message } from './entities/connect.entity';
import { ConfigService } from '@nestjs/config';
import { SupportService } from '../support/support.service';

function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

@Injectable()
export class ConnectService {
  private redisClient: Redis;

  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(PostLike) private readonly likeRepo: Repository<PostLike>,
    @InjectRepository(PostComment) private readonly commentRepo: Repository<PostComment>,
    @InjectRepository(Follow) private readonly followRepo: Repository<Follow>,
    @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectQueue('feed-fanout') private feedQueue: Queue,
    private configService: ConfigService,
    private supportService: SupportService,
  ) {
    this.redisClient = new Redis(this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379');
  }

  // ─── Posts ────────────────────────────────────────────────────────

  async createPost(userId: string, content: string, imageUrl?: string) {
    const post = this.postRepo.create({
      author: { id: userId } as any,
      content,
      imageUrl,
    });
    await this.postRepo.save(post);

    // Queue fan-out job
    await this.feedQueue.add('distribute-post', {
      postId: post.id,
      authorId: userId,
      timestamp: post.createdAt.getTime(),
    });

    return { success: true, data: toPlain(post) };
  }

  async getFeed(userId: string, page = 1, limit = 10) {
    const feedKey = `feed:${userId}`;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // Get post IDs from Redis sorted set
    const postIds = await this.redisClient.zrevrange(feedKey, start, end);

    if (postIds.length === 0) {
      return { data: [], meta: { page, limit, total: 0 } };
    }

    const posts = await this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .whereInIds(postIds)
      .getMany();

    // Sort to match Redis order
    posts.sort((a, b) => postIds.indexOf(a.id) - postIds.indexOf(b.id));

    return { data: toPlain(posts), meta: { page, limit, total: await this.redisClient.zcard(feedKey) } };
  }

  async likePost(userId: string, postId: string) {
    const existingLike = await this.likeRepo.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    });

    if (existingLike) {
      await this.likeRepo.remove(existingLike);
      await this.postRepo.decrement({ id: postId }, 'likesCount', 1);
      return { success: true, message: 'Post unliked' };
    }

    const like = this.likeRepo.create({
      post: { id: postId } as any,
      user: { id: userId } as any,
    });
    await this.likeRepo.save(like);
    await this.postRepo.increment({ id: postId }, 'likesCount', 1);

    const post = await this.postRepo.findOne({ where: { id: postId }, relations: ['author'] });
    if (post && post.author.id !== userId) {
      await this.supportService.createNotification(
        post.author.id,
        'like',
        `Someone liked your post.`,
        `/connect/posts/${postId}`
      );
    }

    return { success: true, message: 'Post liked' };
  }

  async commentPost(userId: string, postId: string, body: string) {
    const comment = this.commentRepo.create({
      post: { id: postId } as any,
      author: { id: userId } as any,
      body,
    });
    await this.commentRepo.save(comment);
    await this.postRepo.increment({ id: postId }, 'commentsCount', 1);

    const post = await this.postRepo.findOne({ where: { id: postId }, relations: ['author'] });
    if (post && post.author.id !== userId) {
      await this.supportService.createNotification(
        post.author.id,
        'comment',
        `Someone commented on your post.`,
        `/connect/posts/${postId}`
      );
    }

    return { success: true, data: toPlain(comment) };
  }

  async getPostComments(postId: string, page = 1, limit = 10) {
    const [data, total] = await this.commentRepo.findAndCount({
      where: { post: { id: postId } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: toPlain(data), meta: { page, limit, total } };
  }

  // ─── Network (Follows) ─────────────────────────────────────────────

  async followUser(followerId: string, followeeId: string) {
    if (followerId === followeeId) throw new BadRequestException('Cannot follow yourself');

    const existing = await this.followRepo.findOne({
      where: { follower: { id: followerId }, followee: { id: followeeId } },
    });

    if (existing) {
      if (existing.status === FollowStatus.ACCEPTED) throw new BadRequestException('Already following');
      if (existing.status === FollowStatus.PENDING) throw new BadRequestException('Follow request pending');
      
      existing.status = FollowStatus.PENDING;
      await this.followRepo.save(existing);
      return { success: true, message: 'Follow request sent' };
    }

    const follow = this.followRepo.create({
      follower: { id: followerId } as any,
      followee: { id: followeeId } as any,
      status: FollowStatus.PENDING,
    });
    await this.followRepo.save(follow);
    
    await this.supportService.createNotification(
      followeeId,
      'follow_request',
      `Someone requested to follow you.`,
      `/connect/profile/${followerId}`
    );

    return { success: true, message: 'Follow request sent' };
  }

  async acceptFollow(userId: string, followerId: string) {
    const follow = await this.followRepo.findOne({
      where: { follower: { id: followerId }, followee: { id: userId } },
    });
    if (!follow) throw new NotFoundException('Follow request not found');
    
    follow.status = FollowStatus.ACCEPTED;
    await this.followRepo.save(follow);

    await this.supportService.createNotification(
      followerId,
      'follow_accepted',
      `Your follow request was accepted.`,
      `/connect/profile/${userId}`
    );

    return { success: true, message: 'Follow request accepted' };
  }

  async rejectFollow(userId: string, followerId: string) {
    const follow = await this.followRepo.findOne({
      where: { follower: { id: followerId }, followee: { id: userId } },
    });
    if (!follow) throw new NotFoundException('Follow request not found');
    
    follow.status = FollowStatus.REJECTED;
    await this.followRepo.save(follow);
    return { success: true, message: 'Follow request rejected' };
  }

  async unfollowUser(followerId: string, followeeId: string) {
    const follow = await this.followRepo.findOne({
      where: { follower: { id: followerId }, followee: { id: followeeId } },
    });
    if (!follow) throw new NotFoundException('Not following this user');
    await this.followRepo.remove(follow);
    return { success: true, message: 'Unfollowed successfully' };
  }

  async getFollowers(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.followRepo.findAndCount({
      where: { followee: { id: userId }, status: FollowStatus.ACCEPTED },
      relations: ['follower'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: toPlain(data.map(f => f.follower)), meta: { page, limit, total } };
  }

  async getFollowing(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.followRepo.findAndCount({
      where: { follower: { id: userId }, status: FollowStatus.ACCEPTED },
      relations: ['followee'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: toPlain(data.map(f => f.followee)), meta: { page, limit, total } };
  }

  async getPendingFollowRequests(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.followRepo.findAndCount({
      where: { followee: { id: userId }, status: FollowStatus.PENDING },
      relations: ['follower'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: toPlain(data), meta: { page, limit, total } };
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.postRepo.findOne({ where: { id: postId }, relations: ['author'] });
    if (!post) throw new NotFoundException('Post not found');
    if (post.author.id !== userId) throw new ForbiddenException('Not your post');
    await this.postRepo.remove(post);
    return { success: true, message: 'Post deleted' };
  }

  async getConversations(userId: string) {
    // Get the most recent message for each unique conversation partner
    const conversations = await this.messageRepo
      .createQueryBuilder('msg')
      .leftJoinAndSelect('msg.sender', 'sender')
      .leftJoinAndSelect('msg.receiver', 'receiver')
      .where('msg.sender.id = :userId', { userId })
      .orWhere('msg.receiver.id = :userId', { userId })
      .orderBy('msg.createdAt', 'DESC')
      .getMany();

    // Deduplicate by conversation partner
    const seen = new Set<string>();
    const uniqueConvos: any[] = [];
    for (const msg of conversations) {
      const partnerId = msg.sender.id === userId ? msg.receiver.id : msg.sender.id;
      if (!seen.has(partnerId)) {
        seen.add(partnerId);
        uniqueConvos.push({
          partner: msg.sender.id === userId ? msg.receiver : msg.sender,
          lastMessage: msg,
        });
      }
    }

    return { data: toPlain(uniqueConvos) };
  }

  async discoverPeople(userId: string, page = 1, limit = 20) {
    // Users not already followed by this user
    const following = await this.followRepo.find({
      where: { follower: { id: userId } },
      relations: ['followee'],
    });
    const followedIds = following.map(f => f.followee.id);
    followedIds.push(userId); // exclude self

    const query = this.userRepo
      .createQueryBuilder('user')
      .where('user.isActive = true')
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (followedIds.length > 0) {
      query.andWhere('user.id NOT IN (:...followedIds)', { followedIds });
    }

    const [data, total] = await query.getManyAndCount();
    const safePeople = data.map(({ password: _, ...rest }) => rest);
    return { data: toPlain(safePeople), meta: { page, limit, total } };
  }

  // ─── DMs ────────────────────────────────────────────────────────────

  async sendMessage(senderId: string, receiverId: string, body: string) {
    const message = this.messageRepo.create({
      sender: { id: senderId } as any,
      receiver: { id: receiverId } as any,
      body,
    });
    await this.messageRepo.save(message);
    return { success: true, data: toPlain(message) };
  }

  async getMessages(userId: string, otherUserId: string, page = 1, limit = 20) {
    const [data, total] = await this.messageRepo
      .createQueryBuilder('msg')
      .leftJoinAndSelect('msg.sender', 'sender')
      .leftJoinAndSelect('msg.receiver', 'receiver')
      .where('(msg.sender.id = :userId AND msg.receiver.id = :otherUserId)', { userId, otherUserId })
      .orWhere('(msg.sender.id = :otherUserId AND msg.receiver.id = :userId)', { userId, otherUserId })
      .orderBy('msg.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: toPlain(data), meta: { page, limit, total } };
  }
}
