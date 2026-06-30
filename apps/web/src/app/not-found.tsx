import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center py-20">
      <div className="container text-center max-w-layout-md">
        <div className="text-9xl font-black text-c800 leading-none mb-4 tracking-tighter shadow-sm mix-blend-screen" style={{ WebkitTextStroke: '1px var(--c-700)', color: 'transparent' }}>
          404
        </div>
        <h1 className="text-3xl font-bold text-c100 mb-4">Page not found</h1>
        <p className="text-lg text-c400 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn btn--primary">Go to Homepage</Link>
          <Link href="/jobs" className="btn btn--ghost">Browse Jobs</Link>
        </div>
      </div>
    </main>
  );
}
