'use client';

import React, { useEffect, useState } from 'react';
import { communityService } from '@/features/community/api/community.service';
import { Heart, UserPlus, DollarSign, MessageSquare, Loader2, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function getNotifIcon(type: string) {
  if (type.includes('follow')) return { Icon: UserPlus, className: 'follow' };
  if (type.includes('like') || type.includes('upvote')) return { Icon: Heart, className: 'like' };
  if (type.includes('salary')) return { Icon: DollarSign, className: 'salary' };
  if (type.includes('comment') || type.includes('message')) return { Icon: MessageSquare, className: 'like' };
  return { Icon: Bell, className: '' };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await communityService.getNotifications();
        if (data && data.data) setNotifications(data.data);
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
      <main className="layout one-col">
        <div className="col center">
          <div className="comm-loading"><Loader2 size={24} /></div>
        </div>
      </main>
    );
  }

  // Split into "New" (unread) and "Earlier" (read)
  const newNotifs = notifications.filter(n => !n.isRead && !n.readAt);
  const earlierNotifs = notifications.filter(n => n.isRead || n.readAt);

  return (
    <main className="layout one-col">
      <div className="col center">
        <div className="card">
          {notifications.length === 0 ? (
            <div className="comm-empty">You have no recent notifications.</div>
          ) : (
            <>
              {newNotifs.length > 0 && (
                <>
                  <div className="notif-group-label">New</div>
                  {newNotifs.map((notif) => {
                    const { Icon, className } = getNotifIcon(notif.type);
                    return (
                      <div key={notif.id} className="notif-row unread">
                        <div className={`notif-icon ${className}`}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="notif-text"
                            dangerouslySetInnerHTML={{ __html: notif.message || notif.content || notif.title }}
                          />
                          <div className="notif-time">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {earlierNotifs.length > 0 && (
                <>
                  <div className="notif-group-label">Earlier</div>
                  {earlierNotifs.map((notif) => {
                    const { Icon, className } = getNotifIcon(notif.type);
                    return (
                      <div key={notif.id} className="notif-row">
                        <div className={`notif-icon ${className}`}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="notif-text"
                            dangerouslySetInnerHTML={{ __html: notif.message || notif.content || notif.title }}
                          />
                          <div className="notif-time">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
