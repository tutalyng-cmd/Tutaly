'use client';

import React, { useEffect, useState } from 'react';
import { communityService } from '@/features/community/api/community.service';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await communityService.getNotifications();
        // data.data is an array if success: true
        if (data && data.data) {
          setNotifications(data.data);
        }
      } catch (e) {
        console.error('Failed to load notifications', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal" />
      </div>
    );
  }

  return (
    <div className="max-w-[920px] mx-auto">
      
      <div className="bg-c800 border border-c700 rounded-2xl p-5">
        <div className="text-[11px] uppercase tracking-[0.08em] text-c500 font-semibold mb-4">Recent Activity</div>
        
        <div className="flex flex-col">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-c500 text-[14px]">
              You have no recent notifications.
            </div>
          ) : (
            notifications.map((notif) => {
              const isUnread = !notif.isRead && !notif.readAt; // backend uses readAt sometimes
              
              // Map notification types to icons
              let icon = '🔔';
              if (notif.type.includes('follow')) icon = '🤝';
              if (notif.type.includes('comment') || notif.type.includes('message')) icon = '💬';
              if (notif.type.includes('like') || notif.type.includes('upvote')) icon = '📈';

              return (
                <div key={notif.id} className={`flex items-start gap-3.5 py-4 border-b border-c700 last:border-0 ${isUnread ? '-mx-5 px-5 bg-teal/5 border-l-[3px] border-l-teal' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-c700 flex items-center justify-center text-[18px] shrink-0">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0 text-[14.5px] leading-[1.4] text-white">
                    {notif.message || notif.content || notif.title}
                    <div className="text-[12px] text-c500 mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  {isUnread && (
                    <div className="w-2 h-2 rounded-full bg-teal shrink-0 mt-2"></div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
