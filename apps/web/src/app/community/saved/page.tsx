'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiAuth } from '@/lib/api';
import { Heart, MessageSquare, Loader2, BookmarkX, BookmarkCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface PostData {
  id: string;
  content: string;
  imageUrls?: string[];
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  author: { id: string; firstName?: string; lastName?: string; email: string, avatar?: string, username?: string };
  createdAt: string;
}

export default function SavedPostsPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchSavedPosts = useCallback(async (pageNum: number, overwrite: boolean = false) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      // Note: we assume the backend returns saved posts populated correctly
      const res = await apiAuth.withToken(token).get(`/connect/posts/saved?page=${pageNum}&limit=10`);
      const newPosts = res.data?.data || [];
      if (newPosts.length < 10) setHasMore(false);
      
      setPosts(prev => overwrite ? newPosts : [...prev, ...newPosts]);
    } catch (err) {
      console.error('Failed to load saved posts', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedPosts(1, true);
  }, [fetchSavedPosts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSavedPosts(nextPage, false);
  };

  const handleUnsave = async (postId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).delete(`/connect/posts/${postId}/save`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {}
  };

  const getAuthorName = (author: any) => {
    if (author.firstName && author.lastName) return `${author.firstName} ${author.lastName}`;
    return author.username || author.email?.split('@')[0] || 'User';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-c900">Saved Posts</h1>
        <p className="text-sm text-c500 mt-1">Posts you've bookmarked to read later</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-c100 p-5 animate-pulse">
              <div className="flex gap-3 items-center mb-4">
                <div className="w-10 h-10 bg-c200 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-c200 rounded w-1/3" />
                  <div className="h-3 bg-c100 rounded w-1/5" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-c100 rounded w-full" />
                <div className="h-4 bg-c100 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-c100 p-12 text-center">
          <div className="w-16 h-16 bg-c100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookmarkCheck className="w-8 h-8 text-c400" />
          </div>
          <h3 className="text-lg font-bold text-c900 mb-2">No saved posts</h3>
          <p className="text-c500 text-sm max-w-sm mx-auto">
            You haven't saved any posts yet. Bookmark interesting posts from your feed to find them here.
          </p>
          <Link href="/community" className="mt-6 inline-block text-sm font-semibold text-green bg-green hover:bg-green px-5 py-2.5 rounded-xl transition-colors">
            Go to Feed
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const authorProfileLink = `/community/profile/${post.author.username || post.author.id}`;
            const displayImage = post.imageUrls?.[0] || post.imageUrl;

            return (
              <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-c100 p-5 hover:shadow-md transition-shadow relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Link href={authorProfileLink}>
                      <div className="relative w-10 h-10 rounded-full bg-green flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                        {post.author.avatar ? (
                          <Image src={post.author.avatar} alt="avatar" fill className="object-cover" unoptimized />
                        ) : (
                          getAuthorName(post.author).charAt(0).toUpperCase()
                        )}
                      </div>
                    </Link>
                    <div>
                      <Link href={authorProfileLink} className="text-sm font-semibold text-c900 hover:underline">
                        {getAuthorName(post.author)}
                      </Link>
                      <p className="text-xs text-c400">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleUnsave(post.id)}
                    className="p-1.5 text-green hover:bg-green rounded-lg transition-colors"
                    title="Remove from saved"
                  >
                    <BookmarkX className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-c800 text-sm leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>

                {displayImage && (
                  <div className="rounded-xl overflow-hidden mb-4 bg-c100 flex justify-center relative" style={{ minHeight: '200px' }}>
                    <Image src={displayImage} alt="Post content" fill className="object-contain" unoptimized />
                  </div>
                )}

                <div className="flex items-center gap-6 pt-3 border-t border-c100">
                  <div className="flex items-center gap-1.5 text-c400 text-sm">
                    <Heart className="w-4 h-4" />
                    <span>{post.likesCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-c400 text-sm">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.commentsCount || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && !loading && posts.length > 0 && (
        <div className="text-center pt-4 pb-8">
          <button onClick={loadMore} className="bg-white border border-c200 text-c700 px-6 py-2 rounded-xl text-sm font-semibold hover:bg-c100 transition-colors shadow-sm">
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
