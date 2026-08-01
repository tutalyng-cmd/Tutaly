'use client';

import React from 'react';

interface Props {
  onClick: () => void;
  userInitials?: string;
}

export default function PostComposerTrigger({ onClick, userInitials = 'MW' }: Props) {
  return (
    <div className="bg-c800 border border-c700 rounded-2xl p-4.5">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-c700 border border-c700 flex items-center justify-center font-mono font-semibold text-[13px] shrink-0 text-white">
          {userInitials}
        </div>
        <div className="flex-1 cursor-text" onClick={onClick}>
          <textarea 
            rows={1} 
            placeholder="Share thoughts, ask a question, or post an update…" 
            className="w-full bg-transparent border-0 resize-none text-white font-sans text-[15px] leading-relaxed min-h-[26px] focus:outline-none placeholder:text-c500 cursor-text"
            readOnly
          ></textarea>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-c700 flex-wrap gap-2.5">
        <div className="flex gap-1.5 flex-wrap">
          <button type="button" onClick={onClick} className="flex items-center gap-1.5 px-3 py-2 rounded-[9px] bg-c700 border border-c700 text-[12.5px] text-c400 font-medium hover:text-white hover:border-c600 transition-colors">
            🖼️ Photo
          </button>
          <button type="button" onClick={onClick} className="flex items-center gap-1.5 px-3 py-2 rounded-[9px] bg-gold/5 border border-gold/40 text-gold text-[12.5px] font-medium hover:border-gold/60 transition-colors">
            💰 Salary tag
          </button>
          <button type="button" onClick={onClick} className="flex items-center gap-1.5 px-3 py-2 rounded-[9px] bg-c700 border border-c700 text-[12.5px] text-c400 font-medium hover:text-white hover:border-c600 transition-colors">
            📊 Poll
          </button>
        </div>
        <button type="button" onClick={onClick} className="px-[18px] py-[9px] rounded-xl border-0 bg-teal text-[#06251D] text-[14px] font-bold hover:brightness-105 transition-all">
          Post
        </button>
      </div>
    </div>
  );
}
