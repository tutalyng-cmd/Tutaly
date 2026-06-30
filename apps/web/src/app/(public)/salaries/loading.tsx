import React from 'react';

export default function SalariesLoading() {
  return (
    <div className="min-h-screen bg-c100 pt-20 pb-16">
      <section className="bg-navy py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="h-12 w-64 bg-c800/50 rounded-lg animate-pulse mx-auto mb-6"></div>
          <div className="h-6 w-96 bg-c800/50 rounded-lg animate-pulse mx-auto mb-10"></div>
          
          <div className="h-16 w-full max-w-3xl bg-white/10 rounded-xl animate-pulse mx-auto"></div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-10">
          <div>
            <div className="h-8 w-48 bg-c200 rounded-lg animate-pulse mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="h-40 bg-white rounded-2xl shadow-sm border border-c200 animate-pulse"></div>
              ))}
            </div>

            {/* Chart Skeleton */}
            <div className="h-96 bg-white rounded-2xl shadow-sm border border-c200 animate-pulse"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
