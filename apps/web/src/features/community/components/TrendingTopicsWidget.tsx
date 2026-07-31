'use client';

import React from 'react';
import { TrendingUp, Users } from 'lucide-react';

export default function TrendingTopicsWidget() {
  return (
    <div className="flex-shrink-0 hidden xl:flex flex-col gap-4" style={{ width: '300px' }}>
      <div className="bg-c900 rounded-lg border border-c700 p-4">
        <div className="flex items-center gap-2 mb-4 text-c300 font-semibold uppercase tracking-wider text-sm">
          <TrendingUp className="w-4 h-4" />
          <h2>Trending Discussions</h2>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 cursor-pointer group">
            <h4 className="text-white text-sm font-medium group-hover:text-blue transition-colors">
              How much are entry-level Frontend Devs making in Lagos?
            </h4>
            <div className="flex items-center gap-2 text-xs text-c400">
              <span className="text-blue">#SalaryTalk</span>
              <span>•</span>
              <span>142 comments</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 cursor-pointer group">
            <h4 className="text-white text-sm font-medium group-hover:text-blue transition-colors">
              Is hybrid work actually a trap for junior engineers?
            </h4>
            <div className="flex items-center gap-2 text-xs text-c400">
              <span className="text-blue">#RemoteWork</span>
              <span>•</span>
              <span>89 comments</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 cursor-pointer group">
            <h4 className="text-white text-sm font-medium group-hover:text-blue transition-colors">
              Layoffs at Paystack? Anyone have inside info?
            </h4>
            <div className="flex items-center gap-2 text-xs text-c400">
              <span className="text-blue">#Fintech</span>
              <span>•</span>
              <span>256 comments</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-c900 rounded-lg border border-c700 p-4">
        <h3 className="text-sm font-semibold text-white mb-2">Community Guidelines</h3>
        <p className="text-xs text-c300 leading-relaxed mb-3">
          Keep discussions professional, constructive, and respectful. Do not post confidential company information.
        </p>
        <div className="flex items-center gap-2 text-xs text-c400">
          <Users className="w-4 h-4" />
          <span>12,450 Professionals Online</span>
        </div>
      </div>
    </div>
  );
}
