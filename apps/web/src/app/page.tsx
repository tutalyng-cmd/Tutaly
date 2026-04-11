import Hero from "@/components/home/Hero";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      
      {/* Featured Jobs Section Placeholder */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-primary">Featured Opportunities</h2>
          <p className="mt-2 text-gray-600">Explore the latest high-priority roles across Nigeria.</p>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Cards will go here */}
            <div className="border border-gray-100 p-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 italic">
              Loading featured jobs...
            </div>
          </div>
        </div>
      </section>

      {/* Platform Stats Placeholder */}
      <section className="bg-primary-dark py-12 text-white border-y border-primary-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <span className="block text-3xl font-bold text-accent-teal">100+</span>
              <span className="text-sm uppercase tracking-widest text-gray-400">Active Jobs</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-accent-teal">50+</span>
              <span className="text-sm uppercase tracking-widest text-gray-400">Companies</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-accent-teal">1k+</span>
              <span className="text-sm uppercase tracking-widest text-gray-400">Members</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-accent-teal">200+</span>
              <span className="text-sm uppercase tracking-widest text-gray-400">Salaries</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
