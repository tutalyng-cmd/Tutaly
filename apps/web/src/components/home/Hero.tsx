export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Empowering Careers, <br />
            <span className="text-accent-teal uppercase">Connecting Nigeria.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
            The #1 platform for jobs, company reviews, salary insights, and professional networking. 
            All in one professional workspace.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl bg-white p-2 shadow-2xl md:flex">
          <div className="flex flex-grow items-center px-4 py-3 md:border-r">
            <span className="text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Job Title or Keyword"
              className="ml-2 w-full border-none bg-transparent text-gray-900 focus:ring-0"
            />
          </div>
          <div className="flex flex-grow items-center px-4 py-3 md:border-r">
            <span className="text-gray-400">📍</span>
            <input
              type="text"
              placeholder="Location (e.g. Lagos)"
              className="ml-2 w-full border-none bg-transparent text-gray-900 focus:ring-0"
            />
          </div>
          <button className="w-full bg-accent-teal px-8 py-3 font-bold text-white transition-all hover:bg-opacity-90 md:w-auto">
            Search
          </button>
        </div>

        {/* Dual CTA */}
        <div className="mt-8 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
          <button className="w-full rounded-full border-2 border-white px-8 py-3 font-semibold text-white transition-all hover:bg-white hover:text-primary sm:w-auto">
            Find a Job
          </button>
          <button className="w-full rounded-full bg-white px-8 py-3 font-semibold text-primary transition-all hover:bg-gray-100 sm:w-auto">
            Post a Job
          </button>
        </div>
      </div>
    </section>
  );
}
