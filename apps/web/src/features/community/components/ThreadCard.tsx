'use client';

import React, { useState } from 'react';
import { CommunityThread, CommunityComment, AnonymityMode } from '../types/community.types';
import { communityService } from '../api/community.service';
import { formatDistanceToNow } from 'date-fns';
import { DollarSign, TrendingUp, MessageCircle, Heart, MessageSquare, ExternalLink, Bookmark, CheckCircle, X, Loader2, Send } from 'lucide-react';

interface Props {
  thread: CommunityThread;
}

export default function ThreadCard({ thread }: Props) {
  const [upvotes, setUpvotes] = useState(thread.upvotes_count || 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Comments State
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [anonymityMode, setAnonymityMode] = useState<AnonymityMode>('job_title_only');
  const [localCommentsCount, setLocalCommentsCount] = useState(thread.comments_count || 0);

  const toggleComments = async () => {
    if (!showComments) {
      setShowComments(true);
      setLoadingComments(true);
      try {
        const res = await communityService.getComments(thread.id);
        setComments(res.data || []);
      } catch (err) {
        console.error('Failed to load comments', err);
      } finally {
        setLoadingComments(false);
      }
    } else {
      setShowComments(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    setIsPostingComment(true);
    try {
      const res = await communityService.addComment(thread.id, {
        content: commentText,
        anonymity_mode: anonymityMode,
      });
      if (res.success && res.data) {
        // Optimistically add to list
        const newComment: CommunityComment = {
          ...res.data,
          // Since the backend 'addComment' just returns the raw entity, it doesn't have the mapped 'author' immediately
          // but we can fake it optimistically for the UI until next reload, or just re-fetch. Let's re-fetch for safety.
        };
        
        // Actually, just refetch
        const fetchRes = await communityService.getComments(thread.id);
        setComments(fetchRes.data || []);
        
        setCommentText('');
        setLocalCommentsCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleUpvote = async () => {
    if (hasVoted) return;
    setUpvotes(prev => prev + 1);
    setHasVoted(true);
    try {
      await communityService.upvoteThread(thread.id);
    } catch (err) {
      setUpvotes(prev => prev - 1);
      setHasVoted(false);
      console.error('Vote failed', err);
    }
  };

  // Determine post type
  let typeClass = 'type-general';
  let EyebrowIcon = MessageCircle;
  let eyebrowLabel = 'DISCUSSION';

  const content = (thread.content || '').toLowerCase();
  const title = (thread.title || '').toLowerCase();

  if (content.includes('salary') || title.includes('salary') || content.includes('comp') || title.includes('negotiat')) {
    typeClass = 'type-salary';
    EyebrowIcon = DollarSign;
    eyebrowLabel = 'SALARY REVEAL';
  } else if (content.includes('career') || title.includes('career') || title.includes('offer') || content.includes('new role') || content.includes('joined')) {
    typeClass = 'type-career';
    EyebrowIcon = TrendingUp;
    eyebrowLabel = 'CAREER MOVE';
  }

  const initials = thread.author?.name === 'Anonymous'
    ? 'AN'
    : (thread.author?.name || '').substring(0, 2).toUpperCase() || 'U';

  const timeAgo = (() => {
    try {
      const raw = formatDistanceToNow(new Date(thread.createdAt), { addSuffix: false });
      return raw
        .replace('about ', '')
        .replace(' hours', 'h')
        .replace(' hour', 'h')
        .replace(' minutes', 'm')
        .replace(' minute', 'm')
        .replace(' days', 'd')
        .replace(' day', 'd')
        .replace(' months', 'mo')
        .replace(' month', 'mo')
        .replace('less than a m', '1m');
    } catch {
      return '';
    }
  })();

  return (
    <div className={`card post ${typeClass}`}>
      <div className="post-inner">
        <div className="post-eyebrow">
          <EyebrowIcon size={13} />
          {eyebrowLabel}
        </div>

        <div className="post-head">
          <div className="post-avatar">{initials}</div>
          <div className="post-meta">
            <div className="post-name-row">
              <span className="post-name">{thread.author.name}</span>
              {!thread.author.isAnonymous && (
                <span className="verified"><CheckCircle size={13} /></span>
              )}
            </div>
            <div className="post-sub">{thread.author.title}</div>
          </div>
          <div className="post-time">{timeAgo}</div>
        </div>

        {thread.title && (
          <h3 style={{ margin: '12px 0 0 54px', fontSize: '15px', fontWeight: 700 }}>{thread.title}</h3>
        )}
        <p className="post-body">{thread.content}</p>

        {/* Media Grid */}
        {thread.media_urls && thread.media_urls.length > 0 && (
          <div 
            className={`grid gap-2 mt-3 ml-[54px] w-[calc(100%-54px)] ${
              thread.media_urls.length === 1 ? 'grid-cols-1' :
              thread.media_urls.length === 2 ? 'grid-cols-2' :
              thread.media_urls.length === 3 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}
          >
            {thread.media_urls.map((url, i) => (
              <div 
                key={i} 
                className={`relative rounded-xl overflow-hidden cursor-pointer border border-c700 bg-c800 ${
                  thread.media_urls!.length === 3 && i === 0 ? 'col-span-2 aspect-[2/1]' : 
                  thread.media_urls!.length === 1 ? 'aspect-auto max-h-[400px]' : 
                  'aspect-square'
                } hover:opacity-90 transition-opacity`}
                onClick={() => setLightboxImage(url)}
              >
                <img src={url} alt="Community thread image" className={`w-full h-full ${thread.media_urls!.length === 1 ? 'object-contain bg-black' : 'object-cover'}`} />
              </div>
            ))}
          </div>
        )}

        <div className="post-actions">
          <button className={`pa-btn like ${hasVoted ? 'voted' : ''}`} onClick={handleUpvote}>
            <Heart size={14} fill={hasVoted ? 'currentColor' : 'none'} /> {upvotes}
          </button>
          <button className={`pa-btn ${showComments ? 'text-white' : ''}`} onClick={toggleComments}>
            <MessageSquare size={14} /> {localCommentsCount}
          </button>
          <button className="pa-btn share">
            <ExternalLink size={14} /> Share
          </button>
          <span className="pa-spacer"></span>
          <button className="pa-btn">
            <Bookmark size={14} />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-c700 bg-c800/30 p-4">
          
          {/* Composer */}
          <div className="flex gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-c700 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
              U
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-c800 border border-c700 rounded-lg px-3 py-2 text-sm text-white placeholder-c400 focus:outline-none focus:border-c600 resize-none min-h-[60px]"
              />
              <div className="flex items-center justify-between">
                <select
                  value={anonymityMode}
                  onChange={(e) => setAnonymityMode(e.target.value as AnonymityMode)}
                  className="bg-transparent text-xs text-c300 border-none focus:outline-none cursor-pointer"
                >
                  <option value="full_name">Post as Full Profile</option>
                  <option value="job_title_only">Post as Job Title</option>
                  <option value="anonymous_employee">Post Anonymously</option>
                </select>
                <button
                  onClick={handlePostComment}
                  disabled={!commentText.trim() || isPostingComment}
                  className="flex items-center gap-2 bg-white text-black px-4 py-1.5 rounded-full text-xs font-medium hover:bg-c100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPostingComment ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  Reply
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          {loadingComments ? (
            <div className="flex justify-center py-4 text-c400">
              <Loader2 size={16} className="animate-spin" />
            </div>
          ) : comments.length > 0 ? (
            <div className="flex flex-col gap-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-c700 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                    {comment.author?.name === 'Anonymous' ? 'AN' : (comment.author?.name || 'U').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="bg-c800 border border-c700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-white">{comment.author?.name}</span>
                          {!comment.author?.isAnonymous && <CheckCircle size={12} className="text-white" />}
                          <span className="text-xs text-c300 ml-1">{comment.author?.title}</span>
                        </div>
                        <span className="text-xs text-c400">
                          {(() => {
                            try {
                              return formatDistanceToNow(new Date(comment.createdAt), { addSuffix: false })
                                .replace('about ', '').replace(' hours', 'h').replace(' hour', 'h').replace(' minutes', 'm').replace(' minute', 'm').replace(' days', 'd').replace(' day', 'd').replace(' months', 'mo').replace(' month', 'mo').replace('less than a m', '1m');
                            } catch { return ''; }
                          })()}
                        </span>
                      </div>
                      <p className="text-sm text-c200 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-c400">
              No comments yet. Be the first to reply!
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-screen p-4 flex justify-center items-center">
            <button 
              className="absolute top-4 right-4 p-2 bg-c800/50 hover:bg-c800 rounded-full text-white transition-colors"
              onClick={() => setLightboxImage(null)}
            >
              <X size={24} />
            </button>
            <img 
              src={lightboxImage} 
              alt="Enlarged community image view" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
