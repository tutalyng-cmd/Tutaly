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

    // Decode token to get userId (or fetch from a context)
    let userId = '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
    } catch(e) {}

    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
    
    socketRef.current = io(`${socketUrl}/chat`, {
      query: { userId },
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to Chat Socket');
    });

    socketRef.current.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
      
      // Update last message in convo list
      setConversations((prev) => {
        const convoExists = prev.find(c => c.otherUser.id === msg.sender.id || c.otherUser.id === msg.receiver.id);
        if (!convoExists) return prev; // Optionally refetch convos here
        
        return prev.map(c => {
          if (c.otherUser.id === msg.sender.id || c.otherUser.id === msg.receiver.id) {
            return { ...c, lastMessage: msg.body, lastMessageAt: msg.createdAt };
          }
          return c;
        });
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // Load messages when active user changes
  useEffect(() => {
    if (!activeUser && !toId) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const targetId = activeUser ? activeUser.id : toId;
        const res = await communityService.getMessages(targetId);
        if (res.data) {
          // Messages are usually DESC, so we reverse them for UI
          setMessages([...res.data].reverse());
        }
        
        // If we loaded via URL 'to' param and don't have activeUser set yet
        if (!activeUser && toId) {
          // Find in convos or set a placeholder
          const convo = conversations.find(c => c.otherUser.id === toId);
          if (convo) setActiveUser(convo.otherUser);
          else setActiveUser({ id: toId, username: 'User' }); // Needs real user fetch in a full app
        }
      } catch(e) {
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
    
    // We can emit directly via socket or use API which emits for us
    try {
      const res = await communityService.sendMessage(activeUser.id, body);
      // The API saves and returns the message, our socket might also emit 'newMessage' to us
      // To prevent duplication, we let the socket handle it, OR we append it and filter dups.
      // Easiest is to append it here, and if socket receives it, filter by ID
      setMessages((prev) => {
        if (prev.find(m => m.id === res.data.id)) return prev;
        return [...prev, res.data];
      });

      setConversations((prev) => {
        return prev.map(c => {
          if (c.otherUser.id === activeUser.id) {
            return { ...c, lastMessage: res.data.body, lastMessageAt: res.data.createdAt };
          }
          return c;
        });
      });
      
    } catch (e) {
      console.error('Send failed', e);
    }
  };

  return (
    <div className="max-w-[920px] mx-auto">
      <div className="bg-c800 border border-c700 rounded-2xl p-0 overflow-hidden grid grid-cols-1 md:grid-cols-[280px_1fr] h-auto md:h-[560px]">
        {/* Message List */}
        <div className="border-b md:border-b-0 md:border-r border-c700 overflow-y-auto max-h-[340px] md:max-h-full">
          {loadingConvos ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-teal" /></div>
          ) : conversations.length === 0 ? (
            <div className="text-c500 text-center py-8 text-[13px]">No conversations yet.</div>
          ) : (
            conversations.map((convo) => {
              const u = convo.otherUser;
              const name = u.firstName ? `${u.firstName} ${u.lastName}` : u.username;
              const init = (u.firstName?.[0] || name[0]).toUpperCase() + (u.lastName?.[0] || '').toUpperCase();
              const isActive = activeUser?.id === u.id;

              return (
                <div 
                  key={convo.id} 
                  onClick={() => setActiveUser(u)}
                  className={`flex gap-3 px-4 py-3 border-b border-c700 items-center hover:bg-c700 transition-colors cursor-pointer ${isActive ? 'bg-c700' : ''}`}
                >
                  <div className="w-[38px] h-[38px] rounded-full bg-c600 border border-c600 shrink-0 flex items-center justify-center font-mono font-semibold text-[12.5px] text-white">
                    {init}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-bold text-white">{name}</div>
                    <div className="text-[12px] text-c400 truncate mt-0.5">{convo.lastMessage}</div>
                  </div>
                  <div className="text-[11px] text-c400 shrink-0">
                    {convo.lastMessageAt && formatDistanceToNow(new Date(convo.lastMessageAt), { addSuffix: true })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Panel */}
        <div className="flex flex-col p-4.5 overflow-y-auto h-[420px] md:h-full">
          {!activeUser ? (
            <div className="flex-1 flex items-center justify-center text-c500 text-[14px]">
              Select a conversation to start messaging
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5 pb-3.5 border-b border-c700 mb-4 shrink-0">
                <div className="w-[38px] h-[38px] rounded-full bg-c700 border border-c700 shrink-0 flex items-center justify-center font-mono font-semibold text-[12.5px] text-white">
                  {(activeUser.firstName?.[0] || activeUser.username[0]).toUpperCase() + (activeUser.lastName?.[0] || '').toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-[14.5px] text-white">
                    {activeUser.firstName ? `${activeUser.firstName} ${activeUser.lastName}` : activeUser.username}
                  </div>
                  <div className="text-xs text-c500">Professional</div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col mb-4">
                {loadingMessages ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-teal" /></div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-c500 text-[13px]">No messages yet. Say hi!</div>
                ) : (
                  messages.map((msg, i) => {
                    const isMine = msg.sender.id !== activeUser.id; // if I am not the activeUser (other person)
                    return (
                      <div 
                        key={msg.id || i} 
                        className={`max-w-[85%] md:max-w-[72%] p-3.5 rounded-xl text-[13.5px] leading-relaxed mb-2.5 text-white ${
                          isMine 
                            ? 'bg-[#1B4B41] border border-teal/30 self-end rounded-br-sm ml-auto' 
                            : 'bg-c700 border border-c600 self-start rounded-bl-sm'
                        }`}
                      >
                        {msg.body}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-2 mt-auto pt-3.5 border-t border-c700 shrink-0">
                <input 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Write a message…" 
                  className="flex-1 bg-c700 border border-c600 rounded-xl px-3.5 py-2.5 text-white text-[13.5px] placeholder:text-c500 focus:outline-none focus:border-teal transition-colors"
                />
                <button 
                  onClick={handleSend}
                  className="px-4.5 py-2 rounded-xl border-0 bg-teal text-[#06251D] text-[14px] font-bold hover:brightness-105 transition-all disabled:opacity-50"
                  disabled={!inputValue.trim()}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPageWrapper() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-teal" /></div>}>
      <MessagesContent />
    </Suspense>
  );
}
