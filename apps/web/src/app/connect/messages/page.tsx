'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { apiAuth } from '@/lib/api';
import { Send, ArrowLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface ConversationData {
  partner: { id: string; firstName?: string; lastName?: string; email: string, avatar?: string, username?: string };
  lastMessage: { body: string; createdAt: string; sender: { id: string } };
}

interface MessageData {
  id: string;
  body: string;
  sender: { id: string };
  receiver: { id: string };
  createdAt: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<ConversationData['partner'] | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).get('/connect/conversations');
      setConversations(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      apiAuth.withToken(token).get('/user/me').then(res => {
        setCurrentUserId(res.data?.data?.id || '');
      }).catch(() => {});
    }
    fetchConversations();
  }, [fetchConversations]);

  const openConversation = async (partner: ConversationData['partner']) => {
    setSelectedPartner(partner);
    setLoadingMessages(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).get(`/connect/messages/${partner.id}?limit=50`);
      setMessages((res.data?.data || []).reverse());
      
      // Mark as read silently
      apiAuth.withToken(token).patch(`/connect/messages/${partner.id}/read`).catch(() => {});
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedPartner) return;
    
    const optimisticMsg: MessageData = {
      id: `temp-${Date.now()}`,
      body: newMessage.trim(),
      sender: { id: currentUserId },
      receiver: { id: selectedPartner.id },
      createdAt: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    const messageToSend = newMessage.trim();
    setNewMessage('');
    setSending(true);
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).post(`/connect/messages/${selectedPartner.id}`, { body: messageToSend });
      
      // Update temp message with real one
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? res.data?.data || m : m));
      fetchConversations(); // refresh sidebar last message
    } catch (err) {
      console.error('Failed to send', err);
      // Remove optimistic message if failed
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
    } finally {
      setSending(false);
    }
  };

  const getName = (p: any) => {
    if (p.firstName && p.lastName) return `${p.firstName} ${p.lastName}`;
    return p.username || p.email?.split('@')[0] || 'User';
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const renderAvatar = (partner: any) => {
    if (partner.avatar) {
      return <img src={partner.avatar} alt="avatar" className="w-full h-full object-cover" />;
    }
    return getName(partner).charAt(0).toUpperCase();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden" style={{ height: 'calc(100dvh - 120px)', minHeight: '600px' }}>
      
      {/* Left Panel: Conversations List */}
      <div className={`w-full lg:w-1/3 flex flex-col border-r border-gray-100 ${selectedPartner ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center">
              <MessageCircle className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-900">No messages yet</p>
              <p className="text-xs text-gray-500 mt-1 mb-4">Start a conversation from someone's profile.</p>
              <Link href="/connect/discover" className="text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl transition-colors">
                Discover People
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {conversations.map((convo) => (
                <button
                  key={convo.partner.id}
                  onClick={() => openConversation(convo.partner)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${selectedPartner?.id === convo.partner.id ? 'bg-teal-50/50' : ''}`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-base shrink-0 overflow-hidden">
                    {renderAvatar(convo.partner)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 truncate pr-2">{getName(convo.partner)}</p>
                      <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(convo.lastMessage.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {convo.lastMessage.sender.id === currentUserId ? 'You: ' : ''}
                      {convo.lastMessage.body}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Chat Window */}
      <div className={`w-full lg:w-2/3 flex flex-col bg-gray-50/30 ${!selectedPartner ? 'hidden lg:flex' : 'flex'}`}>
        {!selectedPartner ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageCircle className="w-16 h-16 text-gray-200 mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-1">Your Messages</h2>
            <p className="text-sm text-gray-500 max-w-sm">Select a conversation from the list to start messaging.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white">
              <button onClick={() => setSelectedPartner(null)} className="lg:hidden text-gray-400 hover:text-gray-600 p-1.5 -ml-2 rounded-lg hover:bg-gray-50 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Link href={`/connect/profile/${selectedPartner.username || selectedPartner.id}`} className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                  {renderAvatar(selectedPartner)}
                </div>
              </Link>
              <div>
                <Link href={`/connect/profile/${selectedPartner.username || selectedPartner.id}`} className="hover:underline">
                  <p className="text-sm font-semibold text-gray-900">{getName(selectedPartner)}</p>
                </Link>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender.id === currentUserId;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMine
                          ? 'bg-teal-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                      }`}>
                        <p>{msg.body}</p>
                        <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-teal-200' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="bg-teal-600 text-white p-3 rounded-xl hover:bg-teal-500 disabled:opacity-40 transition-colors shadow-sm"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
