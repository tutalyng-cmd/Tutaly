'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { apiAuth } from '@/lib/api';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        const res = await apiAuth.withToken(token).get('/connect/notifications?unreadOnly=true');
        // Simple count based on returned length, assuming we aren't paginating heavily for the bell
        // Or if backend returns a meta.total Unread
        setUnreadCount(res.data?.meta?.total || res.data?.data?.length || 0);
      } catch (error) {
        // Silently fail
      }
    };
    fetchUnread();
  }, []);

  return (
    <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors">
      <Bell className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
