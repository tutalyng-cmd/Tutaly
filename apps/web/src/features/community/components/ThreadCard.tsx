'use client';

import React, { useState } from 'react';
import { CommunityThread } from '../types/community.types';
import { communityService } from '../api/community.service';
import { formatDistanceToNow } from 'date-fns';

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

  // Map post types for border colors
  // Default to general if tag isn't explicitly salary or career
  let typeClass = 'border-l-c600';
  let eyebrowText = '💬 Discussion';
  let eyebrowColor = 'text-c500';

  if (thread.content.toLowerCase().includes('salary') || thread.title?.toLowerCase().includes('salary')) {
    typeClass = 'border-l-gold';
    eyebrowText = '💰 Salary reveal';
    eyebrowColor = 'text-gold';
  } else if (thread.content.toLowerCase().includes('career') || thread.title?.toLowerCase().includes('career') || thread.title?.toLowerCase().includes('offer')) {
    typeClass = 'border-l-teal';
    eyebrowText = '📈 Career move';
    eyebrowColor = 'text-teal';
  }

  return (
    <div className="bg-c800 border border-c700 rounded-2xl p-0 overflow-hidden mb-3.5">
      <div className={`px-5 py-4.5 border-l-4 ${typeClass}`}>
        <div className={`font-mono text-[10.5px] tracking-[0.09em] uppercase font-semibold mb-2.5 flex items-center gap-1.5 ${eyebrowColor}`}>
          {eyebrowText}
        </div>
        
        <div className="flex gap-3">
          <div className="w-[42px] h-[42px] rounded-full bg-c700 border border-c700 flex items-center justify-center font-mono font-semibold text-[14px] shrink-0 text-white">
            {thread.author.name === 'Anonymous' ? 'AN' : thread.author.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[14.5px]">
              <span className="font-bold text-white">{thread.author.name}</span>
              {!thread.author.isAnonymous && <span className="text-teal text-[13px]">✔</span>}
            </div>
            <div className="text-[12.5px] text-c500 mt-0.5">{thread.author.title}</div>
          </div>
          <div className="text-c500 text-[12.5px] whitespace-nowrap">
            {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
          </div>
        </div>

        {thread.title && <h3 className="text-[15.5px] font-bold text-white mt-3 ml-[54px] max-w-[calc(100%-54px)]">{thread.title}</h3>}
        <p className="text-[14.5px] leading-[1.55] text-white mt-2 ml-[54px] max-w-[calc(100%-54px)] whitespace-pre-wrap">
          {thread.content}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 mt-3.5 ml-[54px] pt-3 border-t border-c700">
          <button 
            onClick={handleUpvote}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors border-0
              ${hasVoted ? 'text-red bg-c700' : 'text-c500 bg-transparent hover:text-red hover:bg-c700'}`}
          >
            🤍 {upvotes}
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-c500 text-[13px] font-medium bg-transparent border-0 hover:text-white hover:bg-c700 transition-colors">
            💬 {thread.comments_count}
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-c500 text-[13px] font-medium bg-transparent border-0 hover:text-teal hover:bg-c700 transition-colors">
            ↗ Share
          </button>
          <span className="flex-1"></span>
          <button className="flex items-center justify-center w-8 h-8 rounded-lg text-c500 text-[13px] bg-transparent border-0 hover:text-white hover:bg-c700 transition-colors">
            🔖
          </button>
        </div>
      </div>
    </div>
  );
}
