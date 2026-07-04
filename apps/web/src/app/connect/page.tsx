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
    <article className="feed-post reveal visible">
      <div className="feed-post__head" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href={authorProfileLink}>
            <div className="feed-post__avatar" style={{ background: 'var(--blue)' }}>
              {post.author.avatar ? (
                <img src={post.author.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                getAuthorName(post.author).charAt(0).toUpperCase()
              )}
            </div>
          </Link>
          <div>
            <Link href={authorProfileLink} className="feed-post__name hover:underline">
              {getAuthorName(post.author)}
            </Link>
            <div className="feed-post__meta">{new Date(post.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} style={{ color: 'var(--c-400)', padding: '4px' }}>
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-c100 py-1 z-10">
              <button onClick={handleCopyLink} className="w-full text-left px-4 py-2 text-sm text-c700 hover:bg-c100 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Copy Link
              </button>
              {post.author.id === currentUserId ? (
                <button onClick={() => { onDelete(post.id); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-red hover:bg-red/10 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete Post
                </button>
              ) : (
                <button onClick={handleReport} className="w-full text-left px-4 py-2 text-sm text-c700 hover:bg-c100 flex items-center gap-2">
                  <Flag className="w-4 h-4" /> Report Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="feed-post__body whitespace-pre-wrap">{post.content}</p>

      {displayImage && (
        <div className="rounded-xl overflow-hidden mb-4 bg-c100 flex justify-center">
          <img src={displayImage} alt="Post content" className="max-w-full max-h-96 object-contain" />
        </div>
      )}

      <div className="feed-post__actions">
        <span className="feed-post__action" onClick={() => onLike(post.id)}>
          <Heart className="w-4 h-4" /> {post.likesCount || 0} Likes
        </span>
        <span className="feed-post__action" onClick={handleToggleComments}>
          <MessageSquare className="w-4 h-4" /> {post.commentsCount || 0} Comments
        </span>
        <span className="feed-post__action" onClick={handleCopyLink}>
          <LinkIcon className="w-4 h-4" /> Share
        </span>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-c100">
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={newComment} 
              onChange={e => setNewComment(e.target.value)} 
              placeholder="Write a comment..." 
              className="flex-1 border border-c200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue"
              onKeyDown={e => e.key === 'Enter' && handlePostComment()}
            />
            <button onClick={handlePostComment} disabled={!newComment.trim()} className="btn btn--primary btn--sm disabled:opacity-50">
              Post
            </button>
          </div>
          
          <div className="space-y-3">
            {loadingComments ? (
              <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin text-c400 mx-auto" /></div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-c500 text-center py-2">No comments yet. Be the first!</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-c200 shrink-0 overflow-hidden flex items-center justify-center font-bold text-c500 text-xs">
                    {c.author?.avatar ? <img src={c.author.avatar} alt="a" className="w-full h-full object-cover"/> : getAuthorName(c.author)[0].toUpperCase()}
                  </div>
                  <div className="bg-c100 rounded-xl p-3 flex-1">
                    <p className="text-xs font-semibold text-c900 mb-1">{getAuthorName(c.author)}</p>
                    <p className="text-sm text-c800">{c.body}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </article>
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  
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
        setCurrentUser(res.data?.data);
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
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const err = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
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
      setPosts(posts.map(p => p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p));
      fetchFeed(1, true);
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

  const currentInitials = currentUser?.firstName ? currentUser.firstName[0] : (currentUser?.email ? currentUser.email[0].toUpperCase() : '?');

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <div className="page-header__eyebrow">Connect</div>
          <h1 className="page-header__title">Build your professional network.</h1>
          <p className="page-header__sub">Follow industry leaders, join communities, and stay visible to the people who matter.</p>
        </div>
      </header>

      <div className="container">
        <div className="feed-layout">
          
          {/* LEFT: PROFILE */}
          <aside aria-label="Your profile">
            <div className="profile-card">
              <div className="profile-card__avatar">{currentInitials}</div>
              <div className="profile-card__name">{currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : (currentUser?.email || 'Guest')}</div>
              <div className="profile-card__title">Professional · Nigeria</div>
              <div className="profile-card__stats">
                <div className="profile-card__stat">
                  <div className="profile-card__stat-num">412</div>
                  <div className="profile-card__stat-label">Connections</div>
                </div>
                <div className="profile-card__stat">
                  <div className="profile-card__stat-num">38</div>
                  <div className="profile-card__stat-label">Posts</div>
                </div>
              </div>
            </div>

            <div className="suggest-card" style={{ marginTop: '16px' }}>
              <div className="suggest-card__title">Your communities</div>
              <div className="suggest-row">
                <div className="suggest-avatar" style={{ background: 'var(--blue)' }}>🌍</div>
                <div className="suggest-info">
                  <div className="suggest-name">Remote Engineers Africa</div>
                  <div className="suggest-role">12,400 members</div>
                </div>
              </div>
              <div className="suggest-row">
                <div className="suggest-avatar" style={{ background: 'var(--green)' }}>💸</div>
                <div className="suggest-info">
                  <div className="suggest-name">Fintech Builders Network</div>
                  <div className="suggest-role">8,210 members</div>
                </div>
              </div>
            </div>
          </aside>

          {/* CENTER: FEED */}
          <main aria-label="Activity feed">
            <div className="composer">
              <div className="composer__row">
                <div className="composer__avatar">{currentInitials}</div>
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share an update, ask a question, or celebrate a win..."
                    className="composer__input"
                    style={{ width: '100%', resize: 'none', height: '80px', outline: 'none' }}
                  />
                  
                  {imagePreview && (
                    <div className="relative mt-3 inline-block rounded-xl overflow-hidden border border-c200">
                      <img src={imagePreview} alt="Preview" className="max-h-48 object-cover" />
                      <button onClick={removeImage} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-3">
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
                    <button onClick={() => fileInputRef.current?.click()} style={{ color: 'var(--c-400)' }} title="Attach Image">
                      <ImagePlus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCreatePost}
                      disabled={posting || (!newPost.trim() && !imageFile)}
                      className="btn btn--primary btn--sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {posting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {postError && (
              <div className="field-error bg-red/10 border border-red/50 p-3 rounded-lg mb-4 text-sm">
                {postError}
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="feed-post animate-pulse">
                    <div className="feed-post__head">
                      <div className="feed-post__avatar" style={{ background: 'var(--c-600)' }} />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-c600 rounded w-1/3" />
                        <div className="h-3 bg-c700 rounded w-1/5" />
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="h-4 bg-c700 rounded w-full" />
                      <div className="h-4 bg-c700 rounded w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="feed-post text-center" style={{ padding: '48px 20px' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--c-700)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <MessageSquare className="w-8 h-8 text-c400" />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--c-100)', marginBottom: '8px' }}>Your feed is empty</h3>
                <p style={{ fontSize: '14px', color: 'var(--c-400)', maxWidth: '320px', margin: '0 auto' }}>
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
                <button onClick={loadMore} style={{ background: 'var(--c-800)', border: '1px solid var(--c-600)', color: 'var(--c-200)', padding: '8px 24px', borderRadius: 'var(--r-md)', fontSize: '13px', fontWeight: 600 }}>
                  Load More
                </button>
              </div>
            )}
          </main>

          {/* RIGHT: SUGGESTIONS */}
          <aside aria-label="Suggested connections">
            <div className="suggest-card">
              <div className="suggest-card__title">People to follow</div>
              <div className="suggest-row">
                <div className="suggest-avatar" style={{ background: 'var(--blue)' }}>TO</div>
                <div className="suggest-info">
                  <div className="suggest-name">Tunde Olanrewaju</div>
                  <div className="suggest-role">PM Coach, Lagos</div>
                </div>
                <span className="suggest-follow">Follow</span>
              </div>
              <div className="suggest-row">
                <div className="suggest-avatar" style={{ background: 'var(--gold)' }}>PN</div>
                <div className="suggest-info">
                  <div className="suggest-name">Priya Nair</div>
                  <div className="suggest-role">Data Scientist, Remote</div>
                </div>
                <span className="suggest-follow">Follow</span>
              </div>
              <div className="suggest-row">
                <div className="suggest-avatar" style={{ background: 'var(--green)' }}>CE</div>
                <div className="suggest-info">
                  <div className="suggest-name">Chidinma Eze</div>
                  <div className="suggest-role">Staff Engineer, Lagos</div>
                </div>
                <span className="suggest-follow">Follow</span>
              </div>
            </div>

            <div className="suggest-card">
              <div className="suggest-card__title">Trending topics</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href="#" style={{ fontSize: '12px', color: 'var(--c-300)' }}>#RemoteWork</a>
                <a href="#" style={{ fontSize: '12px', color: 'var(--c-300)' }}>#SalaryTransparency</a>
                <a href="#" style={{ fontSize: '12px', color: 'var(--c-300)' }}>#FintechHiring</a>
                <a href="#" style={{ fontSize: '12px', color: 'var(--c-300)' }}>#CareerGrowth</a>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
