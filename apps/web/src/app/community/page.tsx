'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { apiAuth } from '@/lib/api';
import { Send, Heart, MessageSquare, MoreHorizontal, Trash2, ImagePlus, X, Link as LinkIcon, Flag, Loader2 } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import Link from 'next/link';
import SidebarAd from '@/components/ads/SidebarAd';

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
      const res = await apiAuth.withToken(token!).get(`/community/posts/${post.id}/comments`);
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
      await apiAuth.withToken(token!).post(`/community/posts/${post.id}/comments`, { body: newComment });
      setNewComment('');
      loadComments();
    } catch { }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/community/post/${post.id}`);
    setShowMenu(false);
    alert('Link copied!');
  };

  const handleReport = async () => {
    const reason = prompt("Reason for reporting:");
    if (reason) {
      try {
        const token = localStorage.getItem('access_token');
        await apiAuth.withToken(token!).post(`/community/posts/${post.id}/report`, { reason });
        alert('Post reported.');
      } catch { }
    }
    setShowMenu(false);
  };

  const authorProfileLink = `/community/profile/${post.author.username || post.author.id}`;
  const displayImage = post.imageUrls?.[0] || post.imageUrl;

  return (
    <article className="feed-post reveal visible" style={{ position: 'relative' }}>
      <div className="feed-post__head" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href={authorProfileLink}>
            <div className="feed-post__avatar" style={{ background: 'var(--blue)' }}>
              {post.author.avatar ? (
                <img src={post.author.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                getAuthorName(post.author).charAt(0).toUpperCase()
              )}
            </div>
          </Link>
          <div>
            <div className="feed-post__name">
              <Link href={authorProfileLink} style={{ textDecoration: 'none', color: 'inherit' }}>
                {getAuthorName(post.author)}
              </Link>
            </div>
            <div className="feed-post__meta">{new Date(post.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowMenu(!showMenu)} style={{ color: 'var(--c-400)', padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showMenu && (
            <div style={{ position: 'absolute', right: 0, marginTop: '8px', width: '192px', background: 'var(--c-800)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-700)', padding: '4px 0', zIndex: 10 }}>
              <button onClick={handleCopyLink} style={{ width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: '13px', color: 'var(--c-200)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LinkIcon className="w-4 h-4" /> Copy Link
              </button>
              {post.author.id === currentUserId ? (
                <button onClick={() => { onDelete(post.id); setShowMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: '13px', color: 'var(--red)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trash2 className="w-4 h-4" /> Delete Post
                </button>
              ) : (
                <button onClick={handleReport} style={{ width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: '13px', color: 'var(--c-200)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Flag className="w-4 h-4" /> Report Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="feed-post__body" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>

      {displayImage && (
        <div style={{ borderRadius: 'var(--r-md)', overflow: 'hidden', marginBottom: '16px', background: 'var(--c-700)', display: 'flex', justifyContent: 'center' }}>
          <img src={displayImage} alt="Post content" style={{ maxWidth: '100%', maxHeight: '384px', objectFit: 'contain' }} />
        </div>
      )}

      <div className="feed-post__actions">
        <span className="feed-post__action" onClick={() => onLike(post.id)}>
          👍 {post.likesCount || 0} Likes
        </span>
        <span className="feed-post__action" onClick={handleToggleComments}>
          💬 {post.commentsCount || 0} Comments
        </span>
        <span className="feed-post__action" onClick={handleCopyLink}>
          ↗ Share
        </span>
      </div>

      {showComments && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--c-700)' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input 
              type="text" 
              value={newComment} 
              onChange={e => setNewComment(e.target.value)} 
              placeholder="Write a comment..." 
              style={{ flex: 1, background: 'var(--c-700)', border: '1px solid var(--c-600)', borderRadius: 'var(--r-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--c-100)', outline: 'none' }}
              onKeyDown={e => e.key === 'Enter' && handlePostComment()}
            />
            <button onClick={handlePostComment} disabled={!newComment.trim()} style={{ background: 'var(--blue)', color: 'var(--c-100)', border: 'none', borderRadius: 'var(--r-md)', padding: '0 16px', fontSize: '13px', fontWeight: 600, cursor: newComment.trim() ? 'pointer' : 'not-allowed', opacity: newComment.trim() ? 1 : 0.5 }}>
              Post
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loadingComments ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}><Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite', color: 'var(--c-400)', margin: '0 auto' }} /></div>
            ) : comments.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--c-500)', textAlign: 'center', padding: '8px 0' }}>No comments yet. Be the first!</p>
            ) : (
              comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--c-600)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--c-300)', fontSize: '12px' }}>
                    {c.author?.avatar ? <img src={c.author.avatar} alt="a" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : getAuthorName(c.author)[0].toUpperCase()}
                  </div>
                  <div style={{ background: 'var(--c-700)', borderRadius: 'var(--r-md)', padding: '10px 14px', flex: 1 }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--c-100)', marginBottom: '4px' }}>{getAuthorName(c.author)}</p>
                    <p style={{ fontSize: '13px', color: 'var(--c-200)' }}>{c.body}</p>
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
      const res = await apiAuth.withToken(token).get(`/community/feed?page=${pageNum}&limit=10`);
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

      await apiAuth.withToken(token).post('/community/posts', { 
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
      const err = e as { response?: { data?: { message?: string }; status?: number }; message?: string };
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
      await apiAuth.withToken(token).post(`/community/posts/${postId}/like`);
      setPosts(posts.map(p => p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p));
      fetchFeed(1, true);
    } catch (err) {}
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).delete(`/community/posts/${postId}`);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {}
  };

  const currentInitials = currentUser?.firstName ? currentUser.firstName[0] : (currentUser?.email ? currentUser.email[0].toUpperCase() : '?');

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <div className="page-header__eyebrow">Community</div>
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
                <div style={{ flex: 1, minWidth: 0 }}>
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share an update, ask a question, or celebrate a win..."
                    className="composer__input"
                    style={{ width: '100%', resize: 'none', height: '80px', outline: 'none' }}
                  />
                  
                  {imagePreview && (
                    <div style={{ position: 'relative', marginTop: '12px', display: 'inline-block', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--c-600)' }}>
                      <img src={imagePreview} alt="Preview" style={{ maxHeight: '192px', objectFit: 'cover' }} />
                      <button onClick={removeImage} style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--c-900)', color: 'var(--c-100)', padding: '4px', borderRadius: '50%', border: 'none', cursor: 'pointer', opacity: 0.8 }}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImageSelect} />
                    <button onClick={() => fileInputRef.current?.click()} style={{ color: 'var(--c-400)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Attach Image">
                      <ImagePlus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCreatePost}
                      disabled={posting || (!newPost.trim() && !imageFile)}
                      style={{ background: 'var(--blue)', color: 'var(--c-100)', border: 'none', borderRadius: 'var(--r-md)', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: (posting || (!newPost.trim() && !imageFile)) ? 'not-allowed' : 'pointer', opacity: (posting || (!newPost.trim() && !imageFile)) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      {posting ? <Loader2 className="w-4 h-4" style={{ animation: 'spin 1s linear infinite' }} /> : <Send className="w-4 h-4" />}
                      {posting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {postError && (
              <div style={{ background: 'var(--red-10)', border: '1px solid var(--red)', padding: '12px', borderRadius: 'var(--r-md)', marginBottom: '16px', fontSize: '13px', color: 'var(--red)' }}>
                {postError}
              </div>
            )}

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="feed-post" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                    <div className="feed-post__head">
                      <div className="feed-post__avatar" style={{ background: 'var(--c-600)' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                        <div style={{ height: '16px', background: 'var(--c-600)', borderRadius: '4px', width: '33%' }} />
                        <div style={{ height: '12px', background: 'var(--c-700)', borderRadius: '4px', width: '20%' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                      <div style={{ height: '16px', background: 'var(--c-700)', borderRadius: '4px', width: '100%' }} />
                      <div style={{ height: '16px', background: 'var(--c-700)', borderRadius: '4px', width: '80%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="feed-post" style={{ textAlign: 'center', padding: '48px 20px' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--c-700)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <MessageSquare style={{ width: '32px', height: '32px', color: 'var(--c-400)' }} />
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
              <div style={{ textAlign: 'center', paddingTop: '16px', paddingBottom: '32px' }}>
                <button onClick={loadMore} style={{ background: 'var(--c-800)', border: '1px solid var(--c-600)', color: 'var(--c-200)', padding: '8px 24px', borderRadius: 'var(--r-md)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
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

            <SidebarAd placement="community_sidebar" />
          </aside>

        </div>
      </div>
    </div>
  );
}
