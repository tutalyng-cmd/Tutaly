'use client';

import React, { useEffect, useState } from 'react';
import { communityService } from '@/features/community/api/community.service';
import { Heart, UserPlus, DollarSign, MessageSquare, Loader2, Bell, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItem {
  id: string;
  type: string;
  message?: string;
  content?: string;
  title?: string;
  createdAt: string;
  isRead?: boolean;
  readAt?: string | null;
}

function getNotifIcon(type: string) {
  if (type.includes('follow')) return { Icon: UserPlus, className: 'follow' };
  if (type.includes('like') || type.includes('upvote')) return { Icon: Heart, className: 'like' };
  if (type.includes('salary')) return { Icon: DollarSign, className: 'salary' };
  if (type.includes('comment') || type.includes('message')) return { Icon: MessageSquare, className: 'like' };
  return { Icon: Bell, className: '' };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAllRead, setMarkingAllRead] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await communityService.getNotifications();
        if (data && data.data) setNotifications(data.data);
      } catch (e) {
        console.error('Failed to load notifications', e);
        setError('We could not load your notifications. Try again in a moment.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const markAllAsRead = async () => {
    setMarkingAllRead(true);
    setError('');
    try {
      await communityService.markAllNotificationsAsRead();
      setNotifications((current) => current.map((notification) => ({
        ...notification,
        isRead: true,
        readAt: notification.readAt || new Date().toISOString(),
      })));
    } catch (e) {
      console.error('Failed to mark notifications as read', e);
      setError('We could not update your notifications. Please try again.');
    } finally {
      setMarkingAllRead(false);
    }
  };

  if (loading) {
    return (
      <main className="layout one-col">
        <div className="col center">
          <div className="comm-loading" role="status"><Loader2 size={24} /> <span>Loading notifications…</span></div>
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
        <header className="notif-page-header">
          <div>
            <div className="eyebrow">Updates</div>
            <h1>Notifications</h1>
            <p>Activity from your professional community and Tutaly account.</p>
          </div>
          {newNotifs.length > 0 && (
            <button type="button" className="notif-mark-read" onClick={markAllAsRead} disabled={markingAllRead}>
              {markingAllRead && <Loader2 size={14} aria-hidden="true" />}
              {markingAllRead ? 'Updating…' : 'Mark all as read'}
            </button>
          )}
        </header>

        {error && (
          <div className="notif-alert" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <div className="card">
          {notifications.length === 0 ? (
            <div className="comm-empty notif-empty">
              <Bell size={28} aria-hidden="true" />
              <strong>No notifications yet</strong>
              <span>Community and account updates will appear here.</span>
            </div>
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
                          <Icon size={16} aria-hidden="true" />
                        </div>
                        <div>
                          <div className="notif-text">{notif.message || notif.content || notif.title}</div>
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
                          <div className="notif-text">{notif.message || notif.content || notif.title}</div>
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
