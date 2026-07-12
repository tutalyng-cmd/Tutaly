'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PostCard } from './PostCard';
import { apiAuth } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FeedListProps {
  initialPosts?: any[];
  currentUser: any;
  feedType: 'global' | 'following' | 'profile';
  profileId?: string;
}

export function FeedList({ initialPosts = [], currentUser, feedType, profileId }: FeedListProps) {
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [loading, setLoading] = useState(initialPosts.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchPosts = async (currentCursor: string | null = null, reset = false) => {
    try {
      const token = localStorage.getItem('access_token');
      let url = '/connect/feed';
      if (feedType === 'following') {
        url = '/connect/feed?filter=following';
      } else if (feedType === 'profile' && profileId) {
        url = `/connect/users/${profileId}/posts`;
      }
      
      if (currentCursor) {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}cursor=${currentCursor}`;
      }

      const res = await apiAuth.withToken(token!).get(url);
      const data = res.data?.data || [];
      const newCursor = res.data?.meta?.nextCursor;

      if (reset) {
        setPosts(data);
      } else {
        setPosts((prev) => [...prev, ...data]);
      }
      
      setCursor(newCursor || null);
      setHasMore(!!newCursor);
    } catch (error) {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPosts(null, true);
  }, [feedType, profileId]);

  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setLoadingMore(true);
        fetchPosts(cursor, false);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, cursor, feedType, profileId]);

  const handlePostDeleted = (deletedId: string) => {
    setPosts((prev) => prev.filter(p => p.id !== deletedId));
  };

  const handleLikeToggle = (postId: string, newLikedState: boolean, newCount: number) => {
    setPosts((prev) => prev.map(p => {
      if (p.id === postId) {
        return { ...p, isLikedByMe: newLikedState, likesCount: newCount };
      }
      return p;
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-gray-100">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
          <span className="text-2xl">👋</span>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">No posts yet</h3>
        <p className="text-gray-500">
          {feedType === 'following' 
            ? "You aren't following anyone yet, or they haven't posted." 
            : "Be the first to share something with the community!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => {
        if (index === posts.length - 1) {
          return (
            <div ref={lastPostElementRef} key={post.id}>
              <PostCard 
                post={post} 
                currentUserId={currentUser?.id} 
                onDelete={handlePostDeleted}
                onLikeToggle={handleLikeToggle}
              />
            </div>
          );
        }
        return (
          <PostCard 
            key={post.id} 
            post={post} 
            currentUserId={currentUser?.id} 
            onDelete={handlePostDeleted}
            onLikeToggle={handleLikeToggle}
          />
        );
      })}

      {loadingMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}
      
      {!hasMore && posts.length > 0 && (
        <div className="py-8 text-center text-sm text-gray-500">
          You've caught up on all posts.
        </div>
      )}
    </div>
  );
}
