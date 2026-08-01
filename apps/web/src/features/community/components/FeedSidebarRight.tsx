import React from 'react';

export default function FeedSidebarRight() {
  return (
    <div className="hidden lg:flex flex-col gap-4.5 min-w-[300px] w-[300px]">
      {/* Trending Topics */}
      <div className="bg-c800 border border-c700 rounded-2xl p-5">
        <div className="text-[11px] uppercase tracking-[0.08em] text-c500 font-semibold mb-3">Trending Topics</div>
        <div className="flex flex-col">
          <div className="flex justify-between items-baseline py-2.5 border-b border-c700 last:border-0">
            <span className="text-[13.5px] font-semibold text-white">#RemoteWork</span>
            <span className="font-mono text-[11.5px] text-c500">3.2K posts</span>
          </div>
          <div className="flex justify-between items-baseline py-2.5 border-b border-c700 last:border-0">
            <span className="text-[13.5px] font-semibold text-white">#SalaryTransparency</span>
            <span className="font-mono text-[11.5px] text-c500">2.8K posts</span>
          </div>
          <div className="flex justify-between items-baseline py-2.5 border-b border-c700 last:border-0">
            <span className="text-[13.5px] font-semibold text-white">#FintechHiring</span>
            <span className="font-mono text-[11.5px] text-c500">1.1K posts</span>
          </div>
          <div className="flex justify-between items-baseline py-2.5 border-b border-c700 last:border-0">
            <span className="text-[13.5px] font-semibold text-white">#CareerGrowth</span>
            <span className="font-mono text-[11.5px] text-c500">940 posts</span>
          </div>
        </div>
      </div>

      {/* People You May Know */}
      <div className="bg-c800 border border-c700 rounded-2xl p-5">
        <div className="text-[11px] uppercase tracking-[0.08em] text-c500 font-semibold mb-3">People You May Know</div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5 py-2.5 border-b border-c700 last:border-0">
            <div className="w-[38px] h-[38px] rounded-full bg-c700 border border-c700 shrink-0 flex items-center justify-center font-mono font-semibold text-[12.5px] text-white">KJ</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold text-white truncate">Kemi Johnson</div>
              <div className="text-[11.5px] text-c500 truncate">Data Analyst · Paystack</div>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-c600 bg-transparent text-white text-xs font-semibold shrink-0 hover:border-teal hover:text-teal transition-colors">
              Follow
            </button>
          </div>
          <div className="flex items-center gap-2.5 py-2.5 border-b border-c700 last:border-0">
            <div className="w-[38px] h-[38px] rounded-full bg-c700 border border-c700 shrink-0 flex items-center justify-center font-mono font-semibold text-[12.5px] text-white">RS</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold text-white truncate">Rian Saka</div>
              <div className="text-[11.5px] text-c500 truncate">Recruiter · Tutaly</div>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-c600 bg-transparent text-white text-xs font-semibold shrink-0 hover:border-teal hover:text-teal transition-colors">
              Follow
            </button>
          </div>
          <div className="flex items-center gap-2.5 py-2.5 border-b border-c700 last:border-0">
            <div className="w-[38px] h-[38px] rounded-full bg-c700 border border-c700 shrink-0 flex items-center justify-center font-mono font-semibold text-[12.5px] text-white">NP</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold text-white truncate">Nia Peters</div>
              <div className="text-[11.5px] text-c500 truncate">Eng Manager · Flux Robotics</div>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-c600 bg-transparent text-white text-xs font-semibold shrink-0 hover:border-teal hover:text-teal transition-colors">
              Follow
            </button>
          </div>
        </div>
      </div>

      {/* Company Spotlight */}
      <div className="bg-c800 border border-c700 rounded-2xl p-5">
        <div className="text-[11px] uppercase tracking-[0.08em] text-c500 font-semibold mb-3">Company Spotlight</div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-c700 border border-c700 flex items-center justify-center font-sans font-bold text-[15px] text-white">FR</div>
          <div>
            <div className="font-bold text-[14.5px] text-white">Flux Robotics</div>
            <div className="text-gold text-[12.5px] mt-1 font-mono">★★★★☆ 4.3 · 212 reviews</div>
          </div>
        </div>
        <p className="text-[12.5px] text-c400 mt-2.5 leading-relaxed">
          Employees rate work-life balance 4.6/5 this quarter — highest among fintech peers on Tutaly.
        </p>
      </div>
    </div>
  );
}
