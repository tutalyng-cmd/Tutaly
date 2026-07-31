'use client';

import React, { useState } from 'react';
import { CommunityThread } from '../types/community.types';
import { MessageSquare, ArrowBigUp, Share2, Shield, User, Briefcase } from 'lucide-react';
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

  const getAuthorIcon = () => {
    if (!thread.author.isAnonymous) return <User className="w-4 h-4 text-c400" />;
    if (thread.author.name.toLowerCase().includes('employee')) return <Shield className="w-4 h-4 text-[var(--teal)]" />;
    return <Briefcase className="w-4 h-4 text-[var(--blue)]" />;
  };

  return (
    <article className="bg-c900 rounded-lg border border-c700 p-4 transition-colors hover:border-c600">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-c800 flex items-center justify-center overflow-hidden border border-c700">
          {getAuthorIcon()}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm">{thread.author.name}</span>
            {thread.author.isAnonymous && (
              <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-[var(--blue-alpha-30)] text-[var(--blue)]">
                Anonymous
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-c400">
            <span>{thread.author.title}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
            {thread.bowl && (
              <>
                <span>•</span>
                <span className="text-[var(--blue)] font-medium">#{thread.bowl.name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-2 leading-snug">{thread.title}</h3>
      <p className="text-c300 text-sm leading-relaxed mb-4 whitespace-pre-wrap line-clamp-4">
        {thread.content}
      </p>

      <div className="flex items-center gap-4 text-c400">
        <button
          onClick={handleUpvote}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
            hasVoted ? 'bg-[var(--blue-alpha-30)] text-[var(--blue)]' : 'bg-c800 hover:bg-c700'
          }`}
        >
          <ArrowBigUp className={`w-5 h-5 ${hasVoted ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{upvotes}</span>
        </button>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-c800 hover:bg-c700 transition-colors">
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm font-medium">{thread.comments_count} Comments</span>
        </button>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-c800 transition-colors ml-auto">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}
