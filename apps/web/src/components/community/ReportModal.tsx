'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { apiAuth } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'POST' | 'COMMENT';
}

export function ReportModal({ isOpen, onClose, targetId, targetType }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please provide a reason for reporting');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token!).post('/connect/report', {
        targetId,
        targetType,
        reason,
      });
      toast.success('Report submitted successfully. Thank you.');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Report Content</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <p className="mb-4 text-sm text-gray-600">
            If you believe this {targetType.toLowerCase()} violates our community guidelines, please report it. Our moderation team will review it.
          </p>
          
          <div className="mb-4">
            <label htmlFor="reason" className="mb-2 block text-sm font-medium text-gray-700">
              Reason for reporting
            </label>
            <textarea
              id="reason"
              rows={4}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-navy focus:ring-navy"
              placeholder="Please provide details about why you are reporting this content..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
