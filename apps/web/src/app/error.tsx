'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center py-20">
      <div className="container text-center max-w-layout-md">
        <div className="w-20 h-20 bg-red/10 text-red rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          ⚠️
        </div>
        <h1 className="text-3xl font-bold text-c100 mb-4">Something went wrong</h1>
        <p className="text-lg text-c400 mb-8">
          We've encountered an unexpected error. Our team has been notified.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => reset()} className="btn btn--primary">
            Try again
          </button>
          <Link href="/" className="btn btn--ghost">
            Go to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
