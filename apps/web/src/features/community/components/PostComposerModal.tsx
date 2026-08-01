'use client';

import React, { useState } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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

          <div className="flex justify-between items-center pt-2">
            <div>
              <input
                type="file"
                id="media-upload"
                multiple
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={selectedFiles.length >= 4}
              />
              <label
                htmlFor="media-upload"
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
              {isSubmitting ? 'Posting...' : 'Post Thread'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
