'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiAuth } from '@/lib/api';
import { Bell, BellOff, Check, CheckCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface NotificationData {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

const typeIcons: Record<string, string> = {
  like: '❤️',
  comment: '💬',
  follow_request: '👋',
  follow_accepted: '🤝',
  order_delivered: '📦',
  order_completed: '✅',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).get(`/support/notifications?page=${page}&limit=20`);
      setNotifications(res.data?.data || []);
      setTotal(res.data?.meta?.total || 0);
      setUnreadCount(res.data?.meta?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).patch(`/support/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).patch('/support/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-c100">Notifications</h1>
          <p className="text-c400 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-sm font-bold text-white bg-blue hover:bg-blueH px-4 py-2 rounded-xl transition-colors shadow-glow-blue active:scale-95"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-c800/80 backdrop-blur-sm rounded-2xl border border-c700 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-c700 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-c700 rounded w-3/4" />
                  <div className="h-3 bg-c600 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-c800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-c700 p-12 text-center">
          <div className="w-16 h-16 bg-c700 rounded-full flex items-center justify-center mx-auto mb-4">
            <BellOff className="w-8 h-8 text-c400" />
          </div>
          <h3 className="text-lg font-bold text-c100 mb-2">No notifications yet</h3>
          <p className="text-c400 text-sm">When someone interacts with you, you&apos;ll see it here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-2xl border p-4 transition-all cursor-pointer group ${
                notif.isRead
                  ? 'bg-c800/80 backdrop-blur-sm border-c700 hover:border-c600'
                  : 'bg-c700/80 border-blue hover:border-blue shadow-md'
              }`}
              onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-c700 border border-c600 flex items-center justify-center text-lg shrink-0 shadow-sm">
                  {typeIcons[notif.type] || '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-c400' : 'text-c100 font-bold'}`}>
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-c400">{timeAgo(notif.createdAt)}</span>
                    {notif.link && (
                      <Link
                        href={notif.link}
                        className="text-xs text-blue-l hover:text-blue flex items-center gap-1 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
                {!notif.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue shrink-0 mt-1.5 shadow-glow-blue" />
                )}
              </div>
            </div>
          ))}

          {total > 20 && (
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-bold text-c100 bg-c800/80 backdrop-blur-sm border border-c700 rounded-xl hover:bg-c700 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={notifications.length < 20}
                className="px-4 py-2 text-sm font-bold text-white bg-blue rounded-xl hover:bg-blueH shadow-glow-blue disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
