import Link from 'next/link';

export default function AdvertiseLandingPage() {
  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      {/* HERO SECTION */}
      <div className="text-center mb-20">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-white">
          Reach Nigeria&apos;s Most Ambitious Professionals
        </h1>
        <p className="text-xl text-c400 max-w-2xl mx-auto mb-10">
          Advertise on Tutaly and connect with 50,000+ job seekers, employers, and professionals actively growing their careers.
        </p>
        <Link 
          href="/advertise/create" 
          className="inline-flex items-center justify-center px-8 py-4 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg font-semibold text-lg transition-colors"
        >
          Create Your First Ad &rarr;
        </Link>
      </div>

      {/* VALUE PROPS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        <div className="p-8 bg-c900 rounded-2xl shadow-sm border border-c800">
          <div className="text-4xl mb-6">🎯</div>
          <h3 className="text-xl font-bold mb-3 text-white">Targeted Audience</h3>
          <p className="text-c400">Reach professionals by industry, role, location, and behavior to maximize your campaign&apos;s impact.</p>
        </div>
        <div className="p-8 bg-c900 rounded-2xl shadow-sm border border-c800">
          <div className="text-4xl mb-6">📊</div>
          <h3 className="text-xl font-bold mb-3 text-white">Real-time Analytics</h3>
          <p className="text-c400">Track impressions, clicks, conversions, and ROI as they happen with our detailed dashboard.</p>
        </div>
        <div className="p-8 bg-c900 rounded-2xl shadow-sm border border-c800">
          <div className="text-4xl mb-6">💰</div>
          <h3 className="text-xl font-bold mb-3 text-white">Flexible Budgets</h3>
          <p className="text-c400">Start from as low as ₦2,000 per day. No minimum commitment, pause or cancel anytime.</p>
        </div>
      </div>

      {/* AD FORMATS */}
      <div className="mb-24">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">Choose the Right Format for Your Goal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-c900 border border-c800 rounded-xl hover:border-brand-blue transition-colors group">
            <div className="h-32 bg-c800 rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
              <div className="w-11/12 h-12 bg-c700 rounded flex items-center justify-center">
                <span className="text-xs text-c500 font-mono">1200 x 90</span>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">Banner Ad</h3>
            <p className="text-sm text-c400 mb-4 h-16">High visibility full-width banners placed at the top of the homepage, jobs, or shop pages.</p>
            <div className="text-brand-gold font-mono text-sm font-bold">From ₦5,000 / day</div>
          </div>
          
          <div className="p-6 bg-c900 border border-c800 rounded-xl hover:border-brand-green transition-colors group">
            <div className="h-32 bg-c800 rounded-lg mb-6 flex p-4 space-x-3 items-center">
              <div className="w-12 h-12 bg-c700 rounded-md shrink-0"></div>
              <div className="space-y-2 flex-grow">
                <div className="h-3 w-3/4 bg-c700 rounded"></div>
                <div className="h-2 w-1/2 bg-c700 rounded"></div>
              </div>
              <div className="absolute top-6 right-6 text-brand-gold text-xl">⭐</div>
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">Sponsored Job</h3>
            <p className="text-sm text-c400 mb-4 h-16">Promote your active job listings to appear at the very top of search results.</p>
            <div className="text-brand-green font-mono text-sm font-bold">From ₦3,000 / day</div>
          </div>

          <div className="p-6 bg-c900 border border-c800 rounded-xl hover:border-brand-gold transition-colors group">
            <div className="h-32 bg-c800 rounded-lg mb-6 flex flex-col items-center justify-center p-4">
              <div className="w-16 h-16 bg-c700 rounded-lg mb-2"></div>
              <div className="h-2 w-20 bg-c700 rounded"></div>
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">Sponsored Product</h3>
            <p className="text-sm text-c400 mb-4 h-16">Boost your shop listings to the top of their category and homepage highlights.</p>
            <div className="text-brand-gold font-mono text-sm font-bold">From ₦2,500 / day</div>
          </div>

          <div className="p-6 bg-c900 border border-c800 rounded-xl hover:border-brand-blue transition-colors group">
            <div className="h-32 bg-c800 rounded-lg mb-6 flex items-center justify-center p-4">
               <div className="w-full h-full bg-c700 rounded flex items-center justify-center">
                 <span className="text-xs text-c500 font-mono">300 x 250</span>
               </div>
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">Sidebar Ad</h3>
            <p className="text-sm text-c400 mb-4 h-16">Box advertisements consistently visible on the sidebars of the Connect feed and jobs page.</p>
            <div className="text-brand-blue font-mono text-sm font-bold">From ₦2,000 / day</div>
          </div>
        </div>
      </div>

      {/* AUDIENCE STATS */}
      <div className="bg-blue shadow-glow-blue rounded-3xl p-12 text-center border border-c800">
        <h2 className="text-3xl font-bold mb-10 text-white">Join the platform where Nigeria&apos;s talent gathers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-4xl font-mono font-bold text-brand-blue mb-2">50k+</div>
            <div className="text-sm text-c400 uppercase tracking-wide">Monthly Active Users</div>
          </div>
          <div>
            <div className="text-4xl font-mono font-bold text-brand-green mb-2">120+</div>
            <div className="text-sm text-c400 uppercase tracking-wide">Industries Represented</div>
          </div>
          <div>
            <div className="text-4xl font-mono font-bold text-brand-gold mb-2">35</div>
            <div className="text-sm text-c400 uppercase tracking-wide">Nigerian States</div>
          </div>
          <div>
            <div className="text-4xl font-mono font-bold text-brand-red mb-2">10k+</div>
            <div className="text-sm text-c400 uppercase tracking-wide">Daily Searches</div>
          </div>
        </div>
      </div>
    </div>
  );
}
