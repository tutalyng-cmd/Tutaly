'use client';

import React from 'react';
import { FeedList } from './FeedList';

interface ProfileFeedTabProps {
  profileId: string;
  currentUser: any;
}

export function ProfileFeedTab({ profileId, currentUser }: ProfileFeedTabProps) {
  return (
    <div className="mt-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Posts</h3>
      <FeedList 
        feedType="profile" 
        profileId={profileId} 
        currentUser={currentUser} 
      />
    </div>
  );
}
