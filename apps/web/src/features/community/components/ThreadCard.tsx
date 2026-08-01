'use client';

import React, { useState } from 'react';
import { CommunityThread } from '../types/community.types';
import { communityService } from '../api/community.service';
import { formatDistanceToNow } from 'date-fns';
import { DollarSign, TrendingUp, MessageCircle, Heart, MessageSquare, ExternalLink, Bookmark, CheckCircle } from 'lucide-react';

interface Props {
  thread: CommunityThread;
}

export default function ThreadCard({ thread }: Props) {
  const [upvotes, setUpvotes] = useState(thread.upvotes_count);
  const [hasVoted, setHasVoted] = useState(false);

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

  const initials = thread.author.name === 'Anonymous'
    ? 'AN'
    : thread.author.name.substring(0, 2).toUpperCase();

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

        <div className="post-actions">
          <button className={`pa-btn like ${hasVoted ? 'voted' : ''}`} onClick={handleUpvote}>
            <Heart size={14} fill={hasVoted ? 'currentColor' : 'none'} /> {upvotes}
          </button>
          <button className="pa-btn">
            <MessageSquare size={14} /> {thread.comments_count}
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
    </div>
  );
}
