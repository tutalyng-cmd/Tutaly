import React from 'react';

export default function JobsLoading() {
  return (
    <div className="section pt-32 pb-16">
      <div className="container">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-c800 rounded-lg animate-pulse mb-4"></div>
          <div className="h-6 w-48 bg-c800 rounded-lg animate-pulse"></div>
        </div>

        <div className="h-32 w-full bg-c800 rounded-xl animate-pulse mb-8"></div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="w-72 min-h-layout-xl bg-c800 rounded-lg animate-pulse hidden lg:block"></div>
          
          <div className="flex-1 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-32 w-full bg-c800 rounded-lg animate-pulse"></div>
            ))}
          </div>
          
          <div className="hidden lg:block lg:w-96 xl:w-layout-md shrink-0">
            <div className="min-h-layout-xl bg-c800 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
