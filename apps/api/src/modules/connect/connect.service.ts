import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import Redis from 'ioredis';
import { User } from '../user/entities/user.entity';
import {
  Post,
  PostLike,
  PostComment,
  Follow,
  FollowStatus,
  Message,
  Report,
  ReportTargetType,
  PostSave,
} from './entities/connect.entity';
import { ConfigService } from '@nestjs/config';
import { SupportService } from '../support/support.service';

function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

@Injectable()
export class ConnectService {
  private redisClient: Redis | null = null;

  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(PostLike) private readonly likeRepo: Repository<PostLike>,
    @InjectRepository(PostComment)
    private readonly commentRepo: Repository<PostComment>,
    @InjectRepository(Follow) private readonly followRepo: Repository<Follow>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(PostSave)
    private readonly postSaveRepo: Repository<PostSave>,
    @InjectRepository(Report) private readonly reportRepo: Repository<Report>,
    @InjectQueue('feed-fanout') private feedQueue: Queue,
    private configService: ConfigService,
    private supportService: SupportService,
  ) {
    try {
      const redisUrl = this.configService.get<string>('REDIS_URL');
      if (redisUrl) {
        this.redisClient = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });
        this.redisClient.connect().catch((err) => {
          console.warn(
            '[ConnectService] Redis connection failed, feed will use DB fallback:',
            err.message,
          );
          this.redisClient = null;
        });
      }
    } catch {
      console.warn(
        '[ConnectService] Redis init failed, feed will use DB fallback',
      );
    }
  }

  // ─── Posts ────────────────────────────────────────────────────────

  async createPost(userId: string, content: string, imageUrls?: string[]) {
    const author = new User();
    author.id = userId;
    const post = this.postRepo.create({
      author,
      content,
      imageUrls: imageUrls || null,
    });
    await this.postRepo.save(post);

    // Queue fan-out job (fire-and-forget — don't block post creation if Redis is down)
    try {
      await this.feedQueue.add('distribute-post', {
        postId: post.id,
        authorId: userId,
        timestamp: post.createdAt.getTime(),
      });
    } catch (err) {
      console.warn(
        '[ConnectService] Failed to queue feed fan-out (Redis may be unavailable):',
        err,
      );
    }

    return { success: true, data: toPlain(post) };
  }

  async getFeed(userId: string, page = 1, limit = 10) {
    // Try Redis-based feed first
    if (this.redisClient) {
      try {
        const feedKey = `feed:${userId}`;
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        const postIds = await this.redisClient.zrevrange(feedKey, start, end);

        if (postIds.length > 0) {
          const posts = await this.postRepo
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.author', 'author')
            .leftJoinAndSelect('author.seekerProfile', 'seekerProfile')
            .whereInIds(postIds)
            .getMany();

          posts.sort((a, b) => postIds.indexOf(a.id) - postIds.indexOf(b.id));
          const total = await this.redisClient.zcard(feedKey);

          const mappedPosts = posts.map((p) => {
            const { password: _, ...safeAuthor } = p.author;
            return {
              ...p,
              author: {
                ...safeAuthor,
                firstName: p.author.seekerProfile?.firstName,
                lastName: p.author.seekerProfile?.lastName,
              },
            };
          });

          return { data: toPlain(mappedPosts), meta: { page, limit, total } };
        }
      } catch {
        console.warn(
          '[ConnectService] Redis feed read failed, falling back to DB',
        );
      }
    }

    // DB fallback: get posts from people this user follows + own posts
    const followedUsers = await this.followRepo.find({
      where: { follower: { id: userId }, status: FollowStatus.ACCEPTED },
      relations: ['followee'],
    });
    const followedIds = followedUsers.map((f) => f.followee.id);
    followedIds.push(userId); // include own posts

    const [posts, total] = await this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.seekerProfile', 'seekerProfile')
      .where('post.author.id IN (:...ids)', { ids: followedIds })
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const mappedPosts = posts.map((p) => {
      const { password: _, ...safeAuthor } = p.author;
      return {
        ...p,
        author: {
          ...safeAuthor,
          firstName: p.author.seekerProfile?.firstName,
          lastName: p.author.seekerProfile?.lastName,
        },
      };
    });

    return { data: toPlain(mappedPosts), meta: { page, limit, total } };
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

    const postRef = new Post();
    postRef.id = postId;
    const userRef = new User();
    userRef.id = userId;

    const like = this.likeRepo.create({
      post: postRef,
      user: userRef,
    });
    await this.likeRepo.save(like);
    await this.postRepo.increment({ id: postId }, 'likesCount', 1);

    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['author'],
    });
    if (post && post.author.id !== userId) {
      await this.supportService.createNotification(
        post.author.id,
        'like',
        `Someone liked your post.`,
        `/connect/posts/${postId}`,
      );
    }

    return { success: true, message: 'Post liked' };
  }

  async commentPost(userId: string, postId: string, body: string) {
    const postRef = new Post();
    postRef.id = postId;
    const authorRef = new User();
    authorRef.id = userId;

    const comment = this.commentRepo.create({
      post: postRef,
      author: authorRef,
      body,
    });
    await this.commentRepo.save(comment);
    await this.postRepo.increment({ id: postId }, 'commentsCount', 1);

    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['author'],
    });
    if (post && post.author.id !== userId) {
      await this.supportService.createNotification(
        post.author.id,
        'comment',
        `Someone commented on your post.`,
        `/connect/posts/${postId}`,
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
    if (followerId === followeeId)
      throw new BadRequestException('Cannot follow yourself');

    const existing = await this.followRepo.findOne({
      where: { follower: { id: followerId }, followee: { id: followeeId } },
    });

    if (existing) {
      if (existing.status === FollowStatus.ACCEPTED)
        throw new BadRequestException('Already following');
      if (existing.status === FollowStatus.PENDING)
        throw new BadRequestException('Follow request pending');

      existing.status = FollowStatus.PENDING;
      await this.followRepo.save(existing);
      return { success: true, message: 'Follow request sent' };
    }

    const followerRef = new User();
    followerRef.id = followerId;
    const followeeRef = new User();
    followeeRef.id = followeeId;

    const follow = this.followRepo.create({
      follower: followerRef,
      followee: followeeRef,
      status: FollowStatus.PENDING,
    });
    await this.followRepo.save(follow);

    await this.supportService.createNotification(
      followeeId,
      'follow_request',
      `Someone requested to follow you.`,
      `/connect/profile/${followerId}`,
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
      `/connect/profile/${userId}`,
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
      relations: ['follower', 'follower.seekerProfile'],
      skip: (page - 1) * limit,
      take: limit,
    });

    const followers = data.map((f) => {
      const { password: _, ...safeUser } = f.follower;
      return {
        ...safeUser,
        firstName: f.follower.seekerProfile?.firstName,
        lastName: f.follower.seekerProfile?.lastName,
      };
    });

    return { data: toPlain(followers), meta: { page, limit, total } };
  }

  async getFollowing(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.followRepo.findAndCount({
      where: { follower: { id: userId }, status: FollowStatus.ACCEPTED },
      relations: ['followee', 'followee.seekerProfile'],
      skip: (page - 1) * limit,
      take: limit,
    });

    const following = data.map((f) => {
      const { password: _, ...safeUser } = f.followee;
      return {
        ...safeUser,
        firstName: f.followee.seekerProfile?.firstName,
        lastName: f.followee.seekerProfile?.lastName,
      };
    });

    return { data: toPlain(following), meta: { page, limit, total } };
  }

  async getPendingFollowRequests(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.followRepo.findAndCount({
      where: { followee: { id: userId }, status: FollowStatus.PENDING },
      relations: ['follower', 'follower.seekerProfile'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const mappedData = data.map((f) => {
      const { password: _, ...followerData } = f.follower;
      return {
        id: f.id,
        status: f.status,
        createdAt: f.createdAt,
        follower: {
          ...followerData,
          firstName: f.follower.seekerProfile?.firstName,
          lastName: f.follower.seekerProfile?.lastName,
        },
      };
    });

    return { data: toPlain(mappedData), meta: { page, limit, total } };
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['author'],
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.author.id !== userId)
      throw new ForbiddenException('Not your post');
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
    const uniqueConvos: { partner: User; lastMessage: Message }[] = [];
    for (const msg of conversations) {
      const partnerId =
        msg.sender.id === userId ? msg.receiver.id : msg.sender.id;
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
    const followedIds = following.map((f) => f.followee.id);
    followedIds.push(userId); // exclude self

    const query = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.seekerProfile', 'seekerProfile')
      .leftJoinAndSelect('user.settings', 'settings')
      .where('user.isActive = true')
      // Exclude users who have opted out of discovery
      .andWhere(
        `(settings.privacy->>'showInDiscover' IS NULL OR settings.privacy->>'showInDiscover' != 'false')`,
      )
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (followedIds.length > 0) {
      query.andWhere('user.id NOT IN (:...followedIds)', { followedIds });
    }

    const [data, total] = await query.getManyAndCount();
    const safePeople = data.map((u: User) => {
      const { password: _, ...safeUser } = u;
      return {
        ...safeUser,
        firstName: u.seekerProfile?.firstName,
        lastName: u.seekerProfile?.lastName,
      };
    });
    return { data: toPlain(safePeople), meta: { page, limit, total } };
  }

  // ─── DMs ────────────────────────────────────────────────────────────

  async sendMessage(senderId: string, receiverId: string, body: string) {
    const senderRef = new User();
    senderRef.id = senderId;
    const receiverRef = new User();
    receiverRef.id = receiverId;

    const message = this.messageRepo.create({
      sender: senderRef,
      receiver: receiverRef,
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
      .where('(msg.sender.id = :userId AND msg.receiver.id = :otherUserId)', {
        userId,
        otherUserId,
      })
      .orWhere('(msg.sender.id = :otherUserId AND msg.receiver.id = :userId)', {
        userId,
        otherUserId,
      })
      .orderBy('msg.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: toPlain(data), meta: { page, limit, total } };
  }

  async markMessagesAsRead(userId: string, otherUserId: string) {
    await this.messageRepo
      .createQueryBuilder()
      .update(Message)
      .set({ readAt: new Date() })
      .where(
        'receiver.id = :userId AND sender.id = :otherUserId AND readAt IS NULL',
        { userId, otherUserId },
      )
      .execute();
    return { success: true, message: 'Messages marked as read' };
  }

  // ─── Post Saves ─────────────────────────────────────────────────────

  async savePost(userId: string, postId: string) {
    const existingSave = await this.postSaveRepo.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    if (existingSave) {
      throw new BadRequestException('Post already saved');
    }

    const userRef = new User();
    userRef.id = userId;
    const postRef = new Post();
    postRef.id = postId;

    const save = this.postSaveRepo.create({
      user: userRef,
      post: postRef,
    });
    await this.postSaveRepo.save(save);
    return { success: true, message: 'Post saved' };
  }

  async unsavePost(userId: string, postId: string) {
    const save = await this.postSaveRepo.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    if (!save) {
      throw new NotFoundException('Saved post not found');
    }

    await this.postSaveRepo.remove(save);
    return { success: true, message: 'Post unsaved' };
  }

  async getSavedPosts(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.postSaveRepo
      .createQueryBuilder('save')
      .leftJoinAndSelect('save.post', 'post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.seekerProfile', 'seekerProfile')
      .where('save.user.id = :userId', { userId })
      .orderBy('save.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const posts = data.map((s) => {
      const { password: _, ...safeAuthor } = s.post.author;
      return {
        ...s.post,
        author: {
          ...safeAuthor,
          firstName: s.post.author.seekerProfile?.firstName,
          lastName: s.post.author.seekerProfile?.lastName,
        },
      };
    });

    return { data: toPlain(posts), meta: { page, limit, total } };
  }

  // ─── Post Reports ───────────────────────────────────────────────────

  async reportPost(userId: string, postId: string, reason: string) {
    const reporterRef = new User();
    reporterRef.id = userId;

    const report = this.reportRepo.create({
      reporter: reporterRef,
      targetType: ReportTargetType.POST,
      targetId: postId,
      reason,
    });
    await this.reportRepo.save(report);
    return { success: true, message: 'Post reported', data: toPlain(report) };
  }

  // ─── Post Comments (Delete) ──────────────────────────────────────────

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ['author', 'post'],
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author.id !== userId)
      throw new ForbiddenException('Cannot delete other user comments');

    await this.commentRepo.remove(comment);
    await this.postRepo.decrement({ id: comment.post.id }, 'commentsCount', 1);
    return { success: true, message: 'Comment deleted' };
  }

  // ─── Single Post with Comments ───────────────────────────────────────

  async getSinglePost(postId: string) {
    const post = await this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.seekerProfile', 'seekerProfile')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.author', 'commentAuthor')
      .leftJoinAndSelect('commentAuthor.seekerProfile', 'commentAuthorProfile')
      .leftJoinAndSelect('post.likes', 'likes')
      .where('post.id = :postId', { postId })
      .orderBy('comments.createdAt', 'DESC')
      .getOne();

    if (!post) throw new NotFoundException('Post not found');

    const { password: _, ...safeAuthor } = post.author;
    const safePost = {
      ...post,
      author: {
        ...safeAuthor,
        firstName: post.author.seekerProfile?.firstName,
        lastName: post.author.seekerProfile?.lastName,
      },
    };

    return toPlain(safePost);
  }

  // ─── Public Profile ─────────────────────────────────────────────────

  async getPublicProfile(username: string, requesterId: string) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.seekerProfile', 'seekerProfile')
      .leftJoinAndSelect('user.settings', 'settings')
      .where('user.username = :username', { username })
      .getOne();

    if (!user) throw new NotFoundException('User not found');

    // Get user's post count, followers count, following count
    const postsCount = await this.postRepo.count({
      where: { author: { id: user.id } },
    });
    const followersCount = await this.followRepo.count({
      where: { followee: { id: user.id }, status: FollowStatus.ACCEPTED },
    });
    const followingCount = await this.followRepo.count({
      where: { follower: { id: user.id }, status: FollowStatus.ACCEPTED },
    });

    // Privacy check
    const isOwner = user.id === requesterId;
    let isConnected = false;

    if (!isOwner) {
      const connection = await this.followRepo.findOne({
        where: {
          follower: { id: requesterId },
          followee: { id: user.id },
          status: FollowStatus.ACCEPTED,
        },
      });
      isConnected = !!connection;

      if (
        user.settings?.privacy?.profileVisibility === 'connections_only' &&
        !isConnected
      ) {
        throw new ForbiddenException(
          'This profile is only visible to connections',
        );
      }
    }

    // Get recent posts (only if authorized to see full profile, which is checked above)
    const recentPosts = await this.postRepo.find({
      where: { author: { id: user.id } },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const { password: _, ...userSafe } = user;
    return toPlain({
      ...userSafe,
      firstName: user.seekerProfile?.firstName,
      lastName: user.seekerProfile?.lastName,
      avatar: user.seekerProfile?.avatarUrl,
      postsCount,
      followersCount,
      followingCount,
      recentPosts,
    });
  }
}
