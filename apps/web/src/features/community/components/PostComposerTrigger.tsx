'use client';

import React from 'react';

interface Props {
  onClick: () => void;
  userAvatar?: string;
}

export default function PostComposerTrigger({ onClick, userAvatar }: Props) {
  return (
    <div className="bg-c900 rounded-lg border border-c700 p-4 flex gap-4 items-center">
      <div className="w-10 h-10 rounded-full bg-c800 overflow-hidden flex-shrink-0">
        {userAvatar ? (
          <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-blue-alpha-30" />
        )}
      </div>
      <button
        type="button"
        onClick={onClick}
        className="flex-1 bg-c800 hover:bg-c700 transition-colors rounded-full px-6 py-3 text-left text-c400 text-sm font-medium border border-c700"
      >
        Ask a question or share advice...
      </button>
    </div>
  );
}
