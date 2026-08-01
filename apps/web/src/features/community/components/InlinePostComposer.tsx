'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import AnonymitySelectorBar from './AnonymitySelectorBar';
import { AnonymityMode, CommunityBowl } from '../types/community.types';
import { communityService } from '../api/community.service';

interface Props {
  onSuccess: () => void;
  bowls: CommunityBowl[];
  defaultBowlSlug?: string | null;
  userFullName?: string;
  userJobTitle?: string;
  userInitials?: string;
}

export default function InlinePostComposer({ onSuccess, bowls, defaultBowlSlug, userFullName, userJobTitle, userInitials }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [anonymityMode, setAnonymityMode] = useState<AnonymityMode>('job_title_only');
  const [selectedBowlSlug, setSelectedBowlSlug] = useState(defaultBowlSlug || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set default bowl when bowls load
  useEffect(() => {
    if (bowls.length > 0 && !selectedBowlSlug) {
      setSelectedBowlSlug(defaultBowlSlug || bowls[0].slug);
    }
  }, [bowls, defaultBowlSlug, selectedBowlSlug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (selectedFiles.length + files.length > 4) {
        alert('You can only attach up to 4 images per post.');
        return;
      }
      setSelectedFiles(prev => [...prev, ...files]);
      setPreviewUrls(prev => [
        ...prev,
        ...files.map(f => URL.createObjectURL(f))
      ]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedFiles([]);
    setPreviewUrls([]);
    setIsExpanded(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !selectedBowlSlug) return;
    
    setIsSubmitting(true);
    let mediaUrls: string[] = [];

    try {
      if (selectedFiles.length > 0) {
        // Compress images
        const compressedFiles = await Promise.all(
          selectedFiles.map(async (file) => {
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            };
            try {
              return await imageCompression(file, options);
            } catch (error) {
              console.error('Compression error:', error);
              return file; // fallback to original
            }
          })
        );
        
        // Upload compressed images
        const uploadRes = await communityService.uploadMedia(compressedFiles);
        mediaUrls = uploadRes.urls || [];
      }

      await communityService.createThread({
        bowl_slug: selectedBowlSlug,
        title,
        content,
        anonymity_mode: anonymityMode,
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
      });
      resetForm();
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Failed to post thread. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isExpanded) {
    return (
      <div 
        className="card composer cursor-pointer hover:border-c700 transition-colors" 
        onClick={() => setIsExpanded(true)}
      >
        <div className="composer-top pointer-events-none">
          <div className="mini-avatar">{userInitials || 'U'}</div>
          <div className="composer-input">
            <textarea rows={1} placeholder="Share thoughts, ask a question, or post an update…" readOnly></textarea>
          </div>
        </div>
        <div className="composer-tools pointer-events-none">
          <div className="tool-icons">
            <button className="tool-chip"><ImageIcon size={14} /> Photo</button>
          </div>
          <button className="btn-solid">Post</button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="card composer" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'default' }}>
      <div className="flex items-center justify-between border-b border-c800 pb-3 mb-1">
        <div className="flex items-center gap-3">
          <div className="mini-avatar">{userInitials || 'U'}</div>
          <span className="text-sm font-medium text-white">Create Post</span>
        </div>
        <button onClick={() => setIsExpanded(false)} className="text-c400 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <input
            type="text"
            placeholder="Post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent border-none text-white text-lg font-bold outline-none placeholder:text-c500 px-1"
            maxLength={255}
            required
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1">
          <textarea
            placeholder="Add more details..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-transparent border-none text-white outline-none resize-y placeholder:text-c500 px-1"
            style={{ minHeight: '80px' }}
            required
          />
        </div>

        {/* Image Previews */}
        {previewUrls.length > 0 && (
          <div className="flex gap-3 flex-wrap mt-2">
            {previewUrls.map((url, i) => (
              <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-c700 bg-c800">
                <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black rounded-full text-white transition-colors backdrop-blur-sm"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-c800 mt-2">
          <div>
            <input
              type="file"
              id="inline-media-upload"
              multiple
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
              onChange={handleFileChange}
              disabled={selectedFiles.length >= 4}
            />
            <label
              htmlFor="inline-media-upload"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-[13.5px] font-medium ${
                selectedFiles.length >= 4 
                  ? 'text-c600 cursor-not-allowed opacity-50' 
                  : 'text-c400 hover:text-white hover:bg-c800 cursor-pointer border border-transparent hover:border-c700'
              }`}
            >
              <ImageIcon size={16} />
              Add Photos
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim() || !selectedBowlSlug}
            className="btn btn--primary flex items-center gap-2"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
