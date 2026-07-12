'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Share2, MoreHorizontal, Flag, Trash2, ShieldBan } from 'lucide-react';
import { ImageGrid } from './ImageGrid';
import { CommentThread } from './CommentThread';
import { ReportModal } from './ReportModal';
import { apiAuth } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface PostCardProps {
  post: any;
  currentUserId: string;
  onDelete: (id: string) => void;
  onLikeToggle: (id: string, newLikedState: boolean, newCount: number) => void;
}

const getInitials = (user: any) => {
  if (!user) return 'U';
  if (user.firstName && user.lastName) return `${user.firstName[0]}${user.lastName[0]}`;
  return (user.firstName || user.username || user.email || 'U')[0].toUpperCase();
};

const getAuthorName = (author: any) => {
  if (!author) return 'Loading...';
  if (author.firstName && author.lastName) return `${author.firstName} ${author.lastName}`;
  return author.username || author.email?.split('@')[0] || 'User';
};

export function PostCard({ post, currentUserId, onDelete, onLikeToggle }: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  
  const isAuthor = currentUserId === post.author?.id;
  const isLiked = post.isLikedByMe;

  const handleLike = async () => {
    const newLikedState = !isLiked;
    const newCount = isLiked ? Math.max(0, post.likesCount - 1) : post.likesCount + 1;
    
    // Optimistic update
    onLikeToggle(post.id, newLikedState, newCount);
    
    try {
      const token = localStorage.getItem('access_token');
      if (newLikedState) {
        await apiAuth.withToken(token!).post(`/connect/posts/${post.id}/like`);
      } else {
        await apiAuth.withToken(token!).delete(`/connect/posts/${post.id}/like`);
      }
    } catch (error) {
      // Revert on failure
      onLikeToggle(post.id, isLiked, post.likesCount);
      toast.error('Failed to update like');
    }
  };

  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const token = localStorage.getItem('access_token');
        const res = await apiAuth.withToken(token!).get(`/connect/posts/${post.id}/comments`);
        setComments(res.data?.data || []);
      } catch (error) {
        toast.error('Failed to load comments');
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token!).delete(`/connect/posts/${post.id}`);
      onDelete(post.id);
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleBlockUser = async () => {
    if (!window.confirm(`Are you sure you want to block ${getAuthorName(post.author)}? You will no longer see their posts.`)) return;
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token!).post(`/connect/blocks/${post.author.id}`);
      toast.success('User blocked');
      // In a real app we might trigger a refresh of the feed here
      window.location.reload(); 
    } catch (error) {
      toast.error('Failed to block user');
    }
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 mb-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {post.author?.avatarUrl ? (
            <img src={post.author.avatarUrl} alt="Avatar" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
              {getInitials(post.author)}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{getAuthorName(post.author)}</h3>
            <p className="text-xs text-gray-500">
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Just now'}
            </p>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full z-10 mt-1 w-48 overflow-hidden rounded-xl bg-white py-1 shadow-lg border border-gray-100">
              {isAuthor ? (
                <button
                  onClick={() => { setShowMenu(false); handleDelete(); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" /> Delete Post
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { setShowMenu(false); setReportModalOpen(true); }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Flag className="h-4 w-4" /> Report Post
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); handleBlockUser(); }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                  >
                    <ShieldBan className="h-4 w-4" /> Block User
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-gray-800 whitespace-pre-wrap leading-relaxed">{post.body || post.content}</div>

      {post.media && post.media.length > 0 && (
        <ImageGrid images={post.media} />
      )}
      
      {/* Fallback for old data structure if any */}
      {!post.media && post.imageUrls && post.imageUrls.length > 0 && (
        <ImageGrid images={post.imageUrls.map((url: string, i: number) => ({ mediaUrl: url, orderIndex: i }))} />
      )}

      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{post.likesCount || 0}</span>
          </button>
          <button 
            onClick={handleToggleComments}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            <MessageSquare className="h-5 w-5" />
            <span>{post.commentsCount || 0}</span>
          </button>
        </div>
        <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
          <Share2 className="h-5 w-5" />
          <span>Share</span>
        </button>
      </div>

      {showComments && (
        loadingComments ? (
          <div className="py-4 text-center text-sm text-gray-500">Loading comments...</div>
        ) : (
          <CommentThread 
            postId={post.id} 
            comments={comments} 
            onCommentAdded={(newC) => {
              setComments([...comments, newC]);
              // Ideally update parent comments count too, but this works for now
            }} 
          />
        )
      )}

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetId={post.id}
        targetType="POST"
      />
    </div>
  );
}
