'use client';

import React, { useState } from 'react';
import { CommunityThread } from '../types/community.types';
import { communityService } from '../api/community.service';
import { formatDistanceToNow } from 'date-fns';
import { DollarSign, TrendingUp, MessageCircle, Heart, MessageSquare, ExternalLink, Bookmark, CheckCircle, X } from 'lucide-react';

interface Props {
  thread: CommunityThread;
}

export default function ThreadCard({ thread }: Props) {
  const [upvotes, setUpvotes] = useState(thread.upvotes_count || 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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
          <button className="pa-btn">
            <MessageSquare size={14} /> {thread.comments_count || 0}
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
