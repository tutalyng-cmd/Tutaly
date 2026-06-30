'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function SalariesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-c100 pt-32 pb-16 flex items-center justify-center">
      <div className="bg-white border border-red rounded-2xl p-12 text-center max-w-layout-md shadow-md">
        <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red" />
        </div>
        <h2 className="text-2xl font-bold text-c900 mb-4">Failed to load salaries</h2>
        <p className="text-c500 mb-8">
          We couldn't retrieve the salary intelligence data right now.
        </p>
        <button onClick={() => reset()} className="btn btn--primary">
          Try Again
        </button>
      </div>
    </div>
  );
}
