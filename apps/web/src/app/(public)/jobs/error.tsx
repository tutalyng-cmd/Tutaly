'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function JobsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="section pt-32 pb-16 flex items-center justify-center min-h-screen">
      <div className="bg-c800 border border-red rounded-lg p-12 text-center max-w-layout-md shadow-lg shadow-red/5">
        <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red" />
        </div>
        <h2 className="text-2xl font-bold text-c100 mb-4">Something went wrong</h2>
        <p className="text-c300 mb-8">
          We couldn't load the jobs board right now. This is usually a temporary issue with the connection or server.
        </p>
        <button onClick={() => reset()} className="btn btn--primary">
          Try Again
        </button>
      </div>
    </div>
  );
}
