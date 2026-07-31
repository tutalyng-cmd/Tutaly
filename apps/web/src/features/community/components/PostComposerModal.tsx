'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import AnonymitySelectorBar from './AnonymitySelectorBar';
import { AnonymityMode, CommunityBowl } from '../types/community.types';
import { communityService } from '../api/community.service';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  bowls: CommunityBowl[];
  defaultBowlSlug?: string | null;
  userFullName?: string;
  userJobTitle?: string;
}

export default function PostComposerModal({ onClose, onSuccess, bowls, defaultBowlSlug, userFullName, userJobTitle }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [anonymityMode, setAnonymityMode] = useState<AnonymityMode>('job_title_only');
  const [selectedBowlSlug, setSelectedBowlSlug] = useState(defaultBowlSlug || bowls[0]?.slug || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !selectedBowlSlug) return;
    
    setIsSubmitting(true);
    try {
      await communityService.createThread({
        bowl_slug: selectedBowlSlug,
        title,
        content,
        anonymity_mode: anonymityMode,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to post thread. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black-alpha-70 backdrop-blur-sm">
      <div className="bg-c900 rounded-lg border border-c700 w-full max-w-2xl overflow-y-auto shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between p-4 border-b border-c800">
          <h2 className="text-lg font-bold text-white">Create a Post</h2>
          <button onClick={onClose} className="p-2 hover:bg-c800 rounded-full transition-colors text-c400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <AnonymitySelectorBar
            selected={anonymityMode}
            onChange={setAnonymityMode}
            userFullName={userFullName}
            userJobTitle={userJobTitle}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-c300">Select Bowl</label>
            <select
              value={selectedBowlSlug}
              onChange={(e) => setSelectedBowlSlug(e.target.value)}
              className="bg-c800 border border-c700 rounded-md px-3 py-2 text-white outline-none focus:border-blue"
              required
            >
              <option value="" disabled>Select a topic...</option>
              {bowls.map((bowl) => (
                <option key={bowl.id} value={bowl.slug}>{bowl.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-c300">Title</label>
            <input
              type="text"
              placeholder="What's on your mind?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-c800 border border-c700 rounded-md px-3 py-2 text-white outline-none focus:border-blue"
              maxLength={255}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-c300">Body</label>
            <textarea
              placeholder="Add more details..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-c800 border border-c700 rounded-md px-3 py-2 text-white outline-none focus:border-blue resize-y"
              style={{ minHeight: '150px' }}
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="btn btn--primary"
            >
              {isSubmitting ? 'Posting...' : 'Post Thread'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
