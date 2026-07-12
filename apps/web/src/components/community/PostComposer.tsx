'use client';

import React, { useState, useRef } from 'react';
import { Send, ImagePlus, X, Loader2 } from 'lucide-react';
import { apiAuth } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface PostComposerProps {
  onPostCreated: (post: any) => void;
  currentUser: any;
}

const getInitials = (user: any) => {
  if (!user) return 'U';
  if (user.firstName && user.lastName) return `${user.firstName[0]}${user.lastName[0]}`;
  return (user.firstName || user.username || user.email || 'U')[0].toUpperCase();
};

export function PostComposer({ onPostCreated, currentUser }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (selectedImages.length + files.length > 4) {
        toast.error('You can only upload up to 4 images per post');
        return;
      }
      
      setSelectedImages((prev) => [...prev, ...files]);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];
    
    const uploadedUrls: string[] = [];
    const token = localStorage.getItem('access_token');
    
    // Upload each image one by one (or could use Promise.all)
    for (const file of selectedImages) {
      const formData = new FormData();
      formData.append('file', file);
      
      // We assume there's an endpoint to upload media or we are sending it directly
      // If we use Cloudinary or S3 presigned urls, the logic would be here.
      // For now, let's assume we have a simple /connect/upload endpoint that returns { url: "..." }
      // If not, we might need to adjust based on the actual backend implementation
      try {
        const res = await apiAuth.withToken(token!).post('/connect/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedUrls.push(res.data.url);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedImages.length === 0) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // Upload images first
      const imageUrls = await uploadImages();
      
      // Create post
      const res = await apiAuth.withToken(token!).post('/connect/posts', {
        body: content.trim(),
        imageUrls
      });
      
      onPostCreated(res.data.data);
      setContent('');
      setSelectedImages([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      toast.success('Post created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 mb-6">
      <div className="flex gap-4">
        {currentUser?.avatarUrl ? (
          <img src={currentUser.avatarUrl} alt="Avatar" className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
            {getInitials(currentUser)}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, ask a question, or post an update..."
            className="w-full resize-none overflow-hidden bg-transparent pt-2 text-gray-800 placeholder-gray-400 focus:outline-none min-h-[60px]"
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
            disabled={isSubmitting}
          />
          
          {previewUrls.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {previewUrls.map((url, index) => (
                <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
                  <img src={url} alt={`Preview ${index}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <div className="flex gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageSelect} 
                accept="image/jpeg,image/png,image/webp,image/gif" 
                multiple 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting || selectedImages.length >= 4}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ImagePlus className="h-5 w-5 text-teal" />
                <span className="hidden sm:inline">Photo</span>
              </button>
            </div>
            
            <button
              type="submit"
              disabled={(!content.trim() && selectedImages.length === 0) || isSubmitting}
              className="flex items-center gap-2 rounded-full bg-navy px-6 py-2 text-sm font-medium text-white hover:bg-navy-700 disabled:opacity-50 transition-all shadow-sm active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Post</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
