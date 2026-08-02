'use client';

import { toast } from 'react-hot-toast';
import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { createPortal } from 'react-dom';
import imageCompression from 'browser-image-compression';
import { AnonymityMode, CommunityBowl } from '../types/community.types';
import { communityService } from '../api/community.service';
import '../styles/createpost.css';

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        toast.error('You can only attach up to 4 images per post.');
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
      toast.success('Post created successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to post thread. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAnonymityText = () => {
    if (anonymityMode === 'full_name') {
      return <>Colleagues in this bowl will see: <b>{userFullName || 'Anonymous'}, {userJobTitle || 'Member'}</b> — your full profile is visible.</>;
    }
    if (anonymityMode === 'job_title_only') {
      return <>Colleagues in this bowl will see: <b>{userJobTitle || 'Member'}</b> — your name stays hidden.</>;
    }
    return <>Colleagues in this bowl will see: <b>Anonymous Employee</b> — no name or title is shown.</>;
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

  const modalContent = (
    <div className="cp-overlay">
      <div className="cp-modal" role="dialog" aria-label="Create post">
        <div className="cp-modal-header">
            <div>
                <span className="cp-eyebrow">Tutaly Community</span>
                <h1>Share with the room</h1>
            </div>
            <button className="cp-close-btn" aria-label="Close" onClick={() => setIsExpanded(false)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 3l10 10M13 3L3 13" />
                </svg>
            </button>
        </div>

        <div className="cp-section">
            <div className="cp-label-row"><span className="cp-label">Post as</span></div>
            <div className="cp-visibility-track">
                <div 
                  className={`cp-vis-option ${anonymityMode === 'full_name' ? 'cp-active' : ''}`} 
                  onClick={() => setAnonymityMode('full_name')}
                  data-key="full"
                >
                    <svg className="cp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <circle cx="12" cy="8" r="3.4" />
                        <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
                    </svg>
                    <span className="cp-name">Full name</span>
                    <span className="cp-sub">{userFullName || 'Member'}</span>
                </div>
                <div 
                  className={`cp-vis-option ${anonymityMode === 'job_title_only' ? 'cp-active' : ''}`} 
                  onClick={() => setAnonymityMode('job_title_only')}
                  data-key="title"
                >
                    <svg className="cp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <rect x="4" y="8" width="16" height="11" rx="1.6" />
                        <path d="M9 8V6a3 3 0 016 0v2" />
                    </svg>
                    <span className="cp-name">Job title</span>
                    <span className="cp-sub">{userJobTitle || 'Member'}</span>
                </div>
                <div 
                  className={`cp-vis-option ${anonymityMode === 'anonymous_employee' ? 'cp-active' : ''}`} 
                  onClick={() => setAnonymityMode('anonymous_employee')}
                  data-key="anon"
                >
                    <svg className="cp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M12 3l7 3v5.5c0 4.6-3 8.2-7 9.5-4-1.3-7-4.9-7-9.5V6z" />
                    </svg>
                    <span className="cp-name">Anonymous</span>
                    <span className="cp-sub">Employee tag</span>
                </div>
            </div>
            <div className="cp-reveal-strip">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="8" cy="8" r="6.3" />
                    <path d="M8 5v3.5l2.2 1.3" />
                </svg>
                <div>{getAnonymityText()}</div>
            </div>
        </div>

        <div className="cp-section">
            <div className="cp-label-row"><span className="cp-label">Bowl</span></div>
            <select 
              className="cp-bowl-select"
              value={selectedBowlSlug}
              onChange={(e) => setSelectedBowlSlug(e.target.value)}
              required
            >
                <option value="" disabled>Select a topic…</option>
                {bowls.map((bowl) => (
                  <option key={bowl.id} value={bowl.slug}>{bowl.name}</option>
                ))}
            </select>
        </div>

        <div className="cp-section">
            <div className="cp-compose-wrap">
                <input 
                  className="cp-title-input" 
                  type="text" 
                  placeholder="What's the headline?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <textarea 
                  className="cp-body-input"
                  placeholder="Add context — the more specific, the better the advice you'll get."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>
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
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black rounded-full text-white transition-colors backdrop-blur-sm cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
        </div>

        <div className="cp-modal-footer">
            <input
              type="file"
              id="cp-media-upload"
              multiple
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
              onChange={handleFileChange}
              disabled={selectedFiles.length >= 4}
              style={{ display: 'none' }}
            />
            <label htmlFor="cp-media-upload" className="cp-photo-btn">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="8.5" cy="10" r="1.5" />
                    <path d="M21 16l-5-5-4 4-3-3-6 6" />
                </svg>
                Add photos
            </label>
            <button 
              className="cp-post-btn" 
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim() || !content.trim() || !selectedBowlSlug}
            >
              {isSubmitting ? 'Posting...' : 'Post to bowl'}
            </button>
        </div>
      </div>
    </div>
  );

  if (isMounted && typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}
