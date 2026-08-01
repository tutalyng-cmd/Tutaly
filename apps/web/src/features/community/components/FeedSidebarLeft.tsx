'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FileEdit, Bookmark, DollarSign, Building2 } from 'lucide-react';

export default function FeedSidebarLeft() {
  const [profile, setProfile] = useState<{
    firstName: string;
    lastName: string;
    headline: string;
    initials: string;
    connectionsCount: number;
    postsCount: number;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const res = await api.get('/user/profile');
        const data = res.data.data;
        const first = data.firstName || '';
        const last = data.lastName || '';
        const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || 'U';
        const isEmployer = data.role === 'employer';
        const headline = data.seekerProfile?.headline
          || (isEmployer ? `${data.employerProfile?.companyName || 'Employer'} · Tutaly Member` : 'Tutaly Member');

        setProfile({
          firstName: first,
          lastName: last,
          headline,
          initials,
          connectionsCount: data.followersCount || 0,
          postsCount: data.postsCount || 0,
        });
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };
    fetchUser();
  }, []);

  if (!profile) return <div className="col left" />;

  return (
    <div className="col left">
      {/* Profile Card */}
      <div className="card">
        <div className="profile-banner"></div>
        <div className="avatar-ring">
          <div className="avatar">{profile.initials}</div>
        </div>
        <div className="profile-name">{profile.firstName} {profile.lastName}</div>
        <div className="profile-role">{profile.headline}</div>
        <div className="profile-stats">
          <div className="stat"><b>{profile.connectionsCount}</b><span>Connections</span></div>
          <div className="stat"><b>{profile.postsCount}</b><span>Posts</span></div>
        </div>
      </div>

      {/* Shortcuts Card */}
      <div className="card">
        <div className="card-title">Shortcuts</div>
        <div className="shortcut"><span className="ic"><FileEdit size={16} /></span> My Posts</div>
        <div className="shortcut"><span className="ic"><Bookmark size={16} /></span> Saved</div>
        <div className="shortcut"><span className="ic"><DollarSign size={16} /></span> My Salary Reports</div>
        <div className="shortcut"><span className="ic"><Building2 size={16} /></span> Companies I Follow</div>
      </div>
    </div>
  );
}
