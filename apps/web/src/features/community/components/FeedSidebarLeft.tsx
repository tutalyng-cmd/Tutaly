import React from 'react';

export default function FeedSidebarLeft() {
  return (
    <div className="hidden lg:flex flex-col gap-4.5 min-w-[264px] w-[264px]">
      {/* Profile Card */}
      <div className="bg-c800 border border-c700 rounded-2xl p-5">
        <div className="h-[52px] -mx-5 -mt-5 rounded-t-2xl bg-gradient-to-br from-[#1B4B41] to-c800"></div>
        <div className="w-16 h-16 rounded-full -mt-8 ml-1 bg-gradient-to-br from-teal to-gold p-[3px] flex">
          <div className="w-full h-full rounded-full bg-c700 flex items-center justify-center font-sans font-bold text-xl text-white border-2 border-c800">
            MW
          </div>
        </div>
        <div className="font-sans font-semibold text-[17px] mt-3 text-white">Marv Wise</div>
        <div className="text-c400 text-[13px] mt-1">Product Designer · Tutaly Member</div>
        <div className="flex mt-4 border-t border-c700 pt-3.5">
          <div className="flex-1 text-center">
            <b className="block font-mono text-[17px] font-semibold text-white">128</b>
            <span className="text-[11px] text-c500 uppercase tracking-wider">Connections</span>
          </div>
          <div className="flex-1 text-center border-l border-c700">
            <b className="block font-mono text-[17px] font-semibold text-white">14</b>
            <span className="text-[11px] text-c500 uppercase tracking-wider">Posts</span>
          </div>
        </div>
      </div>

      {/* Shortcuts Card */}
      <div className="bg-c800 border border-c700 rounded-2xl p-5">
        <div className="text-[11px] uppercase tracking-[0.08em] text-c500 font-semibold mb-3">Shortcuts</div>
        <div className="flex flex-col">
          <button className="flex items-center gap-2.5 py-2 text-[14px] text-c400 font-medium hover:text-white transition-colors text-left">
            <span className="w-[18px] text-center text-c500">📝</span> My Posts
          </button>
          <button className="flex items-center gap-2.5 py-2 text-[14px] text-c400 font-medium hover:text-white transition-colors text-left">
            <span className="w-[18px] text-center text-c500">🔖</span> Saved
          </button>
          <button className="flex items-center gap-2.5 py-2 text-[14px] text-c400 font-medium hover:text-white transition-colors text-left">
            <span className="w-[18px] text-center text-c500">💰</span> My Salary Reports
          </button>
          <button className="flex items-center gap-2.5 py-2 text-[14px] text-c400 font-medium hover:text-white transition-colors text-left">
            <span className="w-[18px] text-center text-c500">🏢</span> Companies I Follow
          </button>
        </div>
      </div>
    </div>
  );
}
