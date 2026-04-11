import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-primary">
            TUTALY
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden items-center space-x-8 md:flex">
          <Link href="/jobs" className="text-sm font-medium text-gray-700 hover:text-accent-teal">
            Jobs
          </Link>
          <Link href="/reviews" className="text-sm font-medium text-gray-700 hover:text-accent-teal">
            Reviews
          </Link>
          <Link href="/salaries" className="text-sm font-medium text-gray-700 hover:text-accent-teal">
            Salaries
          </Link>
          <Link href="/shop" className="text-sm font-medium text-gray-700 hover:text-accent-teal">
            Shop
          </Link>
          <Link href="/connect" className="text-sm font-medium text-gray-700 hover:text-accent-teal">
            Community
          </Link>
        </div>

        {/* CTAs */}
        <div className="flex items-center space-x-4">
          <Link href="/auth/signin" className="text-sm font-medium text-gray-700 hover:text-primary">
            Sign In
          </Link>
          <Link
            href="/jobs/post"
            className="rounded-full bg-accent-teal px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-opacity-90 active:scale-95"
          >
            Post a Job
          </Link>
        </div>
      </div>
    </nav>
  );
}
