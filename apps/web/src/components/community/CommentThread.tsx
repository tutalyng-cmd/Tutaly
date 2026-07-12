'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { apiAuth } from '@/lib/api';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email: string;
    avatarUrl?: string;
  };
}

interface CommentThreadProps {
  postId: string;
  comments: Comment[];
  onCommentAdded: (comment: Comment) => void;
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

export function CommentThread({ postId, comments, onCommentAdded }: CommentThreadProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await apiAuth.withToken(token!).post('/connect/comments', {
        postId,
        content: newComment.trim(),
      });
      onCommentAdded(res.data.data);
      setNewComment('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      {/* Comment List */}
      <div className="space-y-4 mb-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            {comment.author.avatarUrl ? (
              <img src={comment.author.avatarUrl} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
                {getInitials(comment.author)}
              </div>
            )}
            <div className="flex-1 rounded-2xl bg-gray-50 px-4 py-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-900">{getAuthorName(comment.author)}</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-2">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 resize-none overflow-hidden rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-navy focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy transition-colors min-h-[44px]"
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
          }}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-white hover:bg-navy-700 disabled:opacity-50 transition-colors shrink-0"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </form>
    </div>
  );
}
