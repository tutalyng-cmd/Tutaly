import { api } from '@/lib/api';
import { CommunityBowl, CommunityThread, AnonymityMode } from '../types/community.types';

export const communityService = {
  getTrendingBowls: async () => {
    const res = await api.get('/community/bowls');
    return res.data;
  },

  getFeed: async (params: { bowlSlug?: string; tab: 'global' | 'following'; page: number; limit: number }) => {
    try {
      const res = await api.get('/community/feed', { params });
      return res.data;
    } catch {
      const res = await api.get('/community/feed', { params });
      return res.data;
    }
  },

  createThread: async (data: {
    bowl_slug?: string;
    bowl_name?: string;
    title: string;
    content: string;
    anonymity_mode: AnonymityMode;
    display_title_override?: string;
    media_urls?: string[];
  }) => {
    const res = await api.post('/community/threads', data);
    return res.data;
  },

  uploadMedia: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    // Explicitly set Content-Type to multipart/form-data logic handled by axios automatically when given FormData
    const res = await api.post('/community/threads/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  upvoteThread: async (threadId: string) => {
    const res = await api.post(`/community/threads/${threadId}/vote`);
    return res.data;
  },

  getComments: async (threadId: string) => {
    const res = await api.get(`/community/threads/${threadId}/comments`);
    return res.data;
  },

  addComment: async (
    threadId: string,
    data: { content: string; anonymity_mode: AnonymityMode; display_title_override?: string }
  ) => {
    const res = await api.post(`/community/threads/${threadId}/comments`, data);
    return res.data;
  },

  // ---- Connect Module Integration ----

  getNetwork: async () => {
    const [followers, following] = await Promise.all([
      api.get('/connect/followers'),
      api.get('/connect/following')
    ]);
    return {
      followers: followers.data.data,
      following: following.data.data
    };
  },

  followUser: async (userId: string) => {
    const res = await api.post(`/connect/follow/${userId}`);
    return res.data;
  },

  getDiscoverPeople: async () => {
    const res = await api.get('/connect/discover');
    return res.data;
  },

  getConversations: async () => {
    const res = await api.get('/connect/conversations');
    return res.data;
  },

  getMessages: async (userId: string) => {
    const res = await api.get(`/connect/messages/${userId}`);
    return res.data;
  },

  sendMessage: async (userId: string, body: string) => {
    const res = await api.post(`/connect/messages/${userId}`, { body });
    return res.data;
  },

  getNotifications: async () => {
    const res = await api.get('/support/notifications');
    return res.data;
  },

  markAllNotificationsAsRead: async () => {
    const res = await api.patch('/support/notifications/read-all');
    return res.data;
  },
};
