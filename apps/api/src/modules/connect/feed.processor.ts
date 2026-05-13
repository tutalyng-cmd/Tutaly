import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow, FollowStatus } from './entities/connect.entity';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Processor('feed-fanout')
export class FeedProcessor {
  private redisClient: Redis;

  constructor(
    @InjectRepository(Follow) private readonly followRepo: Repository<Follow>,
    private configService: ConfigService,
  ) {
    this.redisClient = new Redis(this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379');
  }

  @Process('distribute-post')
  async handleDistributePost(job: Job<{ postId: string; authorId: string; timestamp: number }>) {
    const { postId, authorId, timestamp } = job.data;

    // Find all accepted followers of the author
    const followers = await this.followRepo.find({
      where: { followee: { id: authorId }, status: FollowStatus.ACCEPTED },
      relations: ['follower'],
    });

    const pipeline = this.redisClient.pipeline();

    // Fan-out: push post ID to each follower's feed
    for (const f of followers) {
      const feedKey = `feed:${f.follower.id}`;
      // Add to sorted set (score = timestamp)
      pipeline.zadd(feedKey, timestamp, postId);
      // Keep only latest 500 posts
      pipeline.zremrangebyrank(feedKey, 0, -501);
      // Set 7 day TTL for the feed key
      pipeline.expire(feedKey, 7 * 24 * 60 * 60);
    }

    // Also add to the author's own feed
    const authorFeedKey = `feed:${authorId}`;
    pipeline.zadd(authorFeedKey, timestamp, postId);
    pipeline.zremrangebyrank(authorFeedKey, 0, -501);
    pipeline.expire(authorFeedKey, 7 * 24 * 60 * 60);

    await pipeline.exec();
    
    return { distributedTo: followers.length + 1 };
  }
}
