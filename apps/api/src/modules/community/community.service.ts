import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityBowl } from './entities/community-bowl.entity';
import {
  CommunityThread,
  AnonymityMode,
} from './entities/community-thread.entity';
import { CommunityComment } from './entities/community-comment.entity';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(CommunityBowl)
    private readonly bowlRepo: Repository<CommunityBowl>,
    @InjectRepository(CommunityThread)
    private readonly threadRepo: Repository<CommunityThread>,
    @InjectRepository(CommunityComment)
    private readonly commentRepo: Repository<CommunityComment>,
  ) {}

  async getTrendingBowls() {
    return {
      success: true,
      data: await this.bowlRepo.find({
        order: { member_count: 'DESC' },
        take: 20,
      }),
    };
  }

  async getFeed(
    _userId: string | undefined,
    filters: {
      bowlSlug?: string;
      tab: 'global' | 'following';
      page: number;
      limit: number;
    },
  ) {
    const qb = this.threadRepo
      .createQueryBuilder('thread')
      .leftJoinAndSelect('thread.bowl', 'bowl')
      .leftJoin('thread.user', 'user')
      .leftJoin('user.seekerProfile', 'seekerProfile')
      // Note: We don't join the full user by default to preserve anonymity, we only fetch what we need
      .addSelect([
        'user.id',
        'user.username',
        'seekerProfile.firstName',
        'seekerProfile.lastName',
      ])
      .where('thread.status = :status', { status: 'published' })
      .orderBy('thread.createdAt', 'DESC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit);

    if (filters.bowlSlug) {
      qb.andWhere('bowl.slug = :slug', { slug: filters.bowlSlug });
    }

    const [threads, total] = await qb.getManyAndCount();

    // Map threads to apply anonymity rules before sending to frontend
    const mappedThreads = threads.map((t) => {
      let authorName = 'Anonymous';
      const authorTitle = 'Verified Professional';

      if (t.anonymity_mode === AnonymityMode.FULL_NAME && t.user) {
        if (t.user.seekerProfile?.firstName || t.user.seekerProfile?.lastName) {
          authorName =
            `${t.user.seekerProfile?.firstName || ''} ${t.user.seekerProfile?.lastName || ''}`.trim();
        } else {
          authorName = t.user.username || 'Anonymous';
        }
      } else if (t.anonymity_mode === AnonymityMode.JOB_TITLE_ONLY) {
        authorName = t.display_title_override || 'Verified Professional';
      } else if (t.anonymity_mode === AnonymityMode.ANONYMOUS_EMPLOYEE) {
        authorName = t.display_title_override || 'Anonymous Employee';
      }

      return {
        ...t,
        author: {
          name: authorName,
          title: authorTitle,
          isAnonymous: t.anonymity_mode !== AnonymityMode.FULL_NAME,
        },
        user: undefined, // Strip original user object
      };
    });

    return {
      success: true,
      data: mappedThreads,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
      },
    };
  }

  async createThread(
    userId: string,
    dto: {
      bowl_slug: string;
      title: string;
      content: string;
      anonymity_mode: AnonymityMode;
      display_title_override?: string;
    },
  ) {
    const bowl = await this.bowlRepo.findOne({
      where: { slug: dto.bowl_slug },
    });
    if (!bowl) {
      throw new NotFoundException('Bowl not found');
    }

    const thread = this.threadRepo.create({
      bowl: { id: bowl.id },
      user: { id: userId },
      title: dto.title,
      content: dto.content,
      anonymity_mode: dto.anonymity_mode,
      display_title_override: dto.display_title_override,
    });

    await this.threadRepo.save(thread);
    return { success: true, data: thread };
  }

  async upvoteThread(threadId: string, _userId: string) {
    const thread = await this.threadRepo.findOne({ where: { id: threadId } });
    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    // Increment vote count (in a real system, track vote via relation to prevent duplicate votes)
    thread.upvotes_count += 1;
    await this.threadRepo.save(thread);

    return { success: true, data: { upvotes_count: thread.upvotes_count } };
  }
}
