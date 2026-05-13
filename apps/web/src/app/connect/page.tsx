'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiAuth } from '@/lib/api';
import { Send, Heart, MessageSquare, MoreHorizontal, Trash2, ImagePlus } from 'lucide-react';

interface PostData {
  id: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  author: { id: string; firstName?: string; lastName?: string; email: string };
  createdAt: string;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [page, setPage] = useState(1);
  const [currentUserId, setCurrentUserId] = useState('');

  const fetchFeed = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).get(`/connect/feed?page=${page}&limit=15`);
      setPosts(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load feed', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      apiAuth.withToken(token).get('/user/me').then(res => {
        setCurrentUserId(res.data?.data?.id || '');
      }).catch(() => {});
    }
    fetchFeed();
  }, [fetchFeed]);

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    setPostError('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).post('/connect/posts', { content: newPost });
      setNewPost('');
      fetchFeed();
    } catch (err: any) {
      console.error('Failed to create post', err);
      setPostError(err?.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).post(`/connect/posts/${postId}/like`);
      fetchFeed();
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).delete(`/connect/posts/${postId}`);
      fetchFeed();
    } catch (err) {
      console.error('Failed to delete post', err);
    }
  };

  const getAuthorName = (author: PostData['author']) => {
    if (author.firstName && author.lastName) return `${author.firstName} ${author.lastName}`;
    return author.email?.split('@')[0] || 'User';
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {currentUserId ? 'Y' : '?'}
          </div>
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full border-0 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:bg-white resize-none transition-all"
              rows={3}
            />
            <div className="flex justify-between items-center mt-3">
              <button className="text-gray-400 hover:text-teal-600 transition-colors p-1.5 rounded-lg hover:bg-gray-50">
                <ImagePlus className="w-5 h-5" />
              </button>
              <button
                onClick={handleCreatePost}
                disabled={posting || !newPost.trim()}
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {postError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {postError}
        </div>
      )}

      {/* Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-pulse">
              <div className="flex gap-3 items-center mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/5" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Your feed is empty</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Follow people to see their posts here, or create your first post to get the conversation started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              {/* Author Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-sm">
                    {getAuthorName(post.author).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{getAuthorName(post.author)}</p>
                    <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
                  </div>
                </div>
                {post.author.id === currentUserId && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Content */}
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>

              {post.imageUrl && (
                <div className="rounded-xl overflow-hidden mb-4">
                  <img src={post.imageUrl} alt="" className="w-full object-cover max-h-96" />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-6 pt-3 border-t border-gray-50">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors text-sm"
                >
                  <Heart className="w-4 h-4" />
                  <span>{post.likesCount || 0}</span>
                </button>
                <button className="flex items-center gap-1.5 text-gray-500 hover:text-teal-600 transition-colors text-sm">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.commentsCount || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
