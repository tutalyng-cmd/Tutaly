import { api } from '@/lib/api';
import { CommunityBowl, CommunityThread, AnonymityMode } from '../types/community.types';

export const communityService = {
  getTrendingBowls: async () => {
    const res = await api.get('/community/bowls');
    return res.data;
  },

  getFeed: async (params: { bowlSlug?: string; tab: 'global' | 'following'; page: number; limit: number }) => {
    // If we want authenticated feed (e.g. 'following' or to show our upvotes), we should use apiAuth
    // Since some users might be unauthenticated, we handle it conditionally or just let apiAuth fail gracefully to guest mode if tokens are missing.
    try {
      const res = await api.get('/community/feed', { params });
      return res.data;
    } catch {
      const res = await api.get('/community/feed', { params });
      return res.data;
    }
  },

  createThread: async (data: {
    bowl_slug: string;
    title: string;
    content: string;
    anonymity_mode: AnonymityMode;
    display_title_override?: string;
  }) => {
    const res = await api.post('/community/threads', data);
    return res.data;
  },

  upvoteThread: async (threadId: string) => {
    const res = await api.post(`/community/threads/${threadId}/vote`);
    return res.data;
  },
};
