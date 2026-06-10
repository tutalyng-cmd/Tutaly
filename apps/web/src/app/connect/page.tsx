'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { apiAuth } from '@/lib/api';
import { Send, Heart, MessageSquare, MoreHorizontal, Trash2, ImagePlus, X, Link as LinkIcon, Flag, Loader2 } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import Link from 'next/link';

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

const PostItem = ({ post, currentUserId, onDelete, onLike }: { post: PostData, currentUserId: string, onDelete: (id: string) => void, onLike: (id: string) => void }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const getAuthorName = (author: any) => {
    if (author.firstName && author.lastName) return `${author.firstName} ${author.lastName}`;
    return author.username || author.email?.split('@')[0] || 'User';
  };

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await apiAuth.withToken(token!).get(`/connect/posts/${post.id}/comments`);
      setComments(res.data?.data || []);
    } catch { }
    setLoadingComments(false);
  };

  const handleToggleComments = () => {
    if (!showComments && comments.length === 0) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token!).post(`/connect/posts/${post.id}/comments`, { body: newComment });
      setNewComment('');
      loadComments();
    } catch { }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/connect/post/${post.id}`);
    setShowMenu(false);
    alert('Link copied!');
  };

  const handleReport = async () => {
    const reason = prompt("Reason for reporting:");
    if (reason) {
      try {
        const token = localStorage.getItem('access_token');
        await apiAuth.withToken(token!).post(`/connect/posts/${post.id}/report`, { reason });
        alert('Post reported.');
      } catch { }
    }
    setShowMenu(false);
  };

  const authorProfileLink = `/connect/profile/${post.author.username || post.author.id}`;
  const displayImage = post.imageUrls?.[0] || post.imageUrl;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link href={authorProfileLink}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
              {post.author.avatar ? (
                <img src={post.author.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                getAuthorName(post.author).charAt(0).toUpperCase()
              )}
            </div>
          </Link>
          <div>
            <Link href={authorProfileLink} className="text-sm font-semibold text-gray-900 hover:underline">
              {getAuthorName(post.author)}
            </Link>
            <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg">
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
              <button onClick={handleCopyLink} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Copy Link
              </button>
              {post.author.id === currentUserId ? (
                <button onClick={() => { onDelete(post.id); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete Post
                </button>
              ) : (
                <button onClick={handleReport} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Flag className="w-4 h-4" /> Report Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>

      {displayImage && (
        <div className="rounded-xl overflow-hidden mb-4 bg-gray-50 flex justify-center">
          <img src={displayImage} alt="Post content" className="max-w-full max-h-[500px] object-contain" />
        </div>
      )}

      <div className="flex items-center gap-6 pt-3 border-t border-gray-50">
        <button onClick={() => onLike(post.id)} className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors text-sm">
          <Heart className="w-4 h-4" />
          <span>{post.likesCount || 0}</span>
        </button>
        <button onClick={handleToggleComments} className="flex items-center gap-1.5 text-gray-500 hover:text-teal-600 transition-colors text-sm">
          <MessageSquare className="w-4 h-4" />
          <span>{post.commentsCount || 0}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={newComment} 
              onChange={e => setNewComment(e.target.value)} 
              placeholder="Write a comment..." 
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
              onKeyDown={e => e.key === 'Enter' && handlePostComment()}
            />
            <button onClick={handlePostComment} disabled={!newComment.trim()} className="bg-teal-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-teal-500 transition-colors disabled:opacity-50">
              Post
            </button>
          </div>
          
          <div className="space-y-3">
            {loadingComments ? (
              <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto" /></div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-2">No comments yet. Be the first!</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                    {c.author?.avatar ? <img src={c.author.avatar} alt="a" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">{getAuthorName(c.author)[0].toUpperCase()}</div>}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 flex-1">
                    <p className="text-xs font-semibold text-gray-900 mb-1">{getAuthorName(c.author)}</p>
                    <p className="text-sm text-gray-800">{c.body}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function FeedPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFeed = useCallback(async (pageNum: number, overwrite: boolean = false) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).get(`/connect/feed?page=${pageNum}&limit=10`);
      const newPosts = res.data?.data || [];
      if (newPosts.length < 10) setHasMore(false);
      
      setPosts(prev => overwrite ? newPosts : [...prev, ...newPosts]);
    } catch (err) {
      console.error('Failed to load feed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      apiAuth.withToken(token).get('/user/me').then(res => {
        setCurrentUserId(res.data?.data?.id || '');
      }).catch(() => {});
    }
    fetchFeed(1, true);
  }, [fetchFeed]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage, false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && !imageFile) return;
    setPosting(true);
    setPostError('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      let uploadedUrl = null;
      if (imageFile) {
        try {
          uploadedUrl = await uploadToCloudinary(imageFile);
        } catch (uploadErr: any) {
          throw new Error('Image upload failed: ' + uploadErr.message);
        }
      }

      await apiAuth.withToken(token).post('/connect/posts', { 
        content: newPost,
        imageUrls: uploadedUrl ? [uploadedUrl] : undefined
      });
      
      setNewPost('');
      removeImage();
      setPage(1);
      setHasMore(true);
      fetchFeed(1, true);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = e as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
console.error('Failed to create post', err);
      setPostError(err?.message || err?.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).post(`/connect/posts/${postId}/like`);
      // Optimistic update
      setPosts(posts.map(p => p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p));
      fetchFeed(1, true); // Silent refresh
    } catch (err) {}
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).delete(`/connect/posts/${postId}`);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {}
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
            
            {imagePreview && (
              <div className="relative mt-3 inline-block rounded-xl overflow-hidden border border-gray-200">
                <img src={imagePreview} alt="Preview" className="max-h-48 object-cover" />
                <button onClick={removeImage} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center mt-3">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
              <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-teal-600 transition-colors p-1.5 rounded-lg hover:bg-gray-50" title="Attach Image">
                <ImagePlus className="w-5 h-5" />
              </button>
              <button
                onClick={handleCreatePost}
                disabled={posting || (!newPost.trim() && !imageFile)}
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
            <PostItem key={post.id} post={post} currentUserId={currentUserId} onDelete={handleDeletePost} onLike={handleLike} />
          ))}
        </div>
      )}

      {hasMore && !loading && posts.length > 0 && (
        <div className="text-center pt-4 pb-8">
          <button onClick={loadMore} className="bg-white border border-gray-200 text-gray-700 px-6 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
