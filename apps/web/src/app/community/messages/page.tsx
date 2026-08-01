'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { communityService } from '@/features/community/api/community.service';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { formatDistanceToNow } from 'date-fns';

function MessagesContent() {
  const searchParams = useSearchParams();
  const toId = searchParams.get('to');

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    async function load() {
      try {
        const res = await communityService.getConversations();
        if (res.data) setConversations(res.data);
      } catch (e) {
        console.error('Failed to load conversations', e);
      } finally {
        setLoadingConvos(false);
      }
    }
    load();
  }, []);

  // Initialize socket
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    let userId = '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
    } catch (e) { /* empty */ }

    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

    socketRef.current = io(`${socketUrl}/chat`, {
      query: { userId },
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setConversations((prev) =>
        prev.map(c => {
          if (c.otherUser.id === msg.sender.id || c.otherUser.id === msg.receiver.id) {
            return { ...c, lastMessage: msg.body, lastMessageAt: msg.createdAt };
          }
          return c;
        })
      );
    });

    return () => { socketRef.current?.disconnect(); };
  }, []);

  // Load messages when active user changes
  useEffect(() => {
    if (!activeUser && !toId) return;
    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const targetId = activeUser ? activeUser.id : toId;
        const res = await communityService.getMessages(targetId);
        if (res.data) setMessages([...res.data].reverse());

        if (!activeUser && toId) {
          const convo = conversations.find(c => c.otherUser.id === toId);
          if (convo) setActiveUser(convo.otherUser);
          else setActiveUser({ id: toId, username: 'User' });
        }
      } catch (e) {
        console.error('Failed to load messages', e);
      } finally {
        setLoadingMessages(false);
      }
    };
    loadMessages();
  }, [activeUser, toId, conversations]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !activeUser) return;
    const body = inputValue;
    setInputValue('');
    try {
      const res = await communityService.sendMessage(activeUser.id, body);
      setMessages((prev) => {
        if (prev.find(m => m.id === res.data.id)) return prev;
        return [...prev, res.data];
      });
      setConversations((prev) =>
        prev.map(c => {
          if (c.otherUser.id === activeUser.id) {
            return { ...c, lastMessage: res.data.body, lastMessageAt: res.data.createdAt };
          }
          return c;
        })
      );
    } catch (e) {
      console.error('Send failed', e);
    }
  };

  const getInitials = (u: any) => {
    const first = u.firstName || u.username || 'U';
    const last = u.lastName || '';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const getName = (u: any) => {
    return u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.username;
  };

  return (
    <main className="layout one-col">
      <div className="col center">
        <div className="card msg-shell">
          {/* Thread List */}
          <div className="msg-list">
            {loadingConvos ? (
              <div className="comm-loading"><Loader2 size={20} /></div>
            ) : conversations.length === 0 ? (
              <div className="comm-empty">No conversations yet.</div>
            ) : (
              conversations.map((convo) => {
                const u = convo.otherUser;
                const isActive = activeUser?.id === u.id;
                return (
                  <div
                    key={convo.id}
                    onClick={() => setActiveUser(u)}
                    className={`msg-thread ${isActive ? 'active' : ''}`}
                  >
                    <div className="suggest-avatar">{getInitials(u)}</div>
                    <div className="msg-thread-info">
                      <div className="msg-thread-name">{getName(u)}</div>
                      <div className="msg-thread-preview">{convo.lastMessage}</div>
                    </div>
                    {convo.lastMessageAt && (
                      <div className="msg-thread-time">
                        {formatDistanceToNow(new Date(convo.lastMessageAt), { addSuffix: false })
                          .replace('about ', '').replace(' hours', 'h').replace(' hour', 'h')
                          .replace(' minutes', 'm').replace(' minute', 'm')
                          .replace(' days', 'd').replace(' day', 'd')}
                      </div>
                    )}
                    {convo.unreadCount > 0 && <div className="msg-unread" />}
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Panel */}
          <div className="msg-panel">
            {!activeUser ? (
              <div className="comm-empty" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Select a conversation to start messaging
              </div>
            ) : (
              <>
                <div className="msg-panel-head">
                  <div className="suggest-avatar">{getInitials(activeUser)}</div>
                  <div>
                    <div className="msg-panel-name">{getName(activeUser)}</div>
                    <div className="msg-panel-role">{activeUser.seekerProfile?.headline || 'Professional'}</div>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
                  {loadingMessages ? (
                    <div className="comm-loading"><Loader2 size={20} /></div>
                  ) : messages.length === 0 ? (
                    <div className="comm-empty">No messages yet. Say hi!</div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMine = msg.sender.id !== activeUser.id;
                      return (
                        <div key={msg.id || i} className={`bubble ${isMine ? 'out' : 'in'}`}>
                          {msg.body}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="msg-composer">
                  <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Write a message…"
                  />
                  <button className="btn-solid" onClick={handleSend} disabled={!inputValue.trim()}>Send</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function MessagesPageWrapper() {
  return (
    <Suspense fallback={<div className="comm-loading"><Loader2 size={24} /></div>}>
      <MessagesContent />
    </Suspense>
  );
}
