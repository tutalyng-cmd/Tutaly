'use client';

import React, { useEffect, useState } from 'react';
import { communityService } from '../api/community.service';

export default function FeedSidebarRight() {
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const loadDiscover = async () => {
      try {
        const res = await communityService.getDiscoverPeople();
        setSuggestions(res.data || []);
      } catch (err) {
        console.error('Failed to load discover people', err);
      }
    };
    loadDiscover();
  }, []);

  const handleFollow = async (userId: string) => {
    try {
      await communityService.followUser(userId);
      setSuggestions((prev) => prev.filter(s => s.id !== userId));
    } catch (err) {
      console.error('Follow failed', err);
    }
  };

  return (
    <div className="col right">
      {suggestions.length > 0 && (
        <div className="card">
          <div className="card-title">People You May Know</div>
          {suggestions.slice(0, 3).map((user) => {
            const first = user.firstName || user.seekerProfile?.firstName || 'User';
            const last = user.lastName || user.seekerProfile?.lastName || '';
            const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
            const headline = user.seekerProfile?.headline || user.headline || 'Tutaly Member';

            return (
              <div key={user.id} className="suggest-row">
                <div className="suggest-avatar">{initials}</div>
                <div className="suggest-info">
                  <div className="suggest-name">{first} {last}</div>
                  <div className="suggest-role">{headline}</div>
                </div>
                <button className="follow-btn" onClick={() => handleFollow(user.id)}>Follow</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
