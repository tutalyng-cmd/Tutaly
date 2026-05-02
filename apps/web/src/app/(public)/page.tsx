import Hero from "@/components/home/Hero";
import Link from "next/link";
import { Briefcase, MapPin, Building2, TrendingUp, MonitorPlay, Code, HeartHandshake, ShieldCheck } from "lucide-react";

async function fetchFeaturedJobs() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/jobs?isFeatured=true&limit=6`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

const INDUSTRIES = [
  { name: 'Technology', icon: <MonitorPlay className="w-6 h-6 text-teal-600" />, jobs: 120 },
  { name: 'Finance', icon: <TrendingUp className="w-6 h-6 text-teal-600" />, jobs: 85 },
  { name: 'Engineering', icon: <Code className="w-6 h-6 text-teal-600" />, jobs: 64 },
  { name: 'Healthcare', icon: <HeartHandshake className="w-6 h-6 text-teal-600" />, jobs: 42 },
];

export default async function Home() {
  const featuredJobs = await fetchFeaturedJobs();

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      
      {/* Featured Jobs Section */}
      <section className="bg-gray-50 py-20 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
               <h2 className="text-3xl font-bold text-gray-900">Featured Opportunities</h2>
               <p className="mt-2 text-gray-500">Explore the latest high-priority roles globally.</p>
            </div>
            <Link href="/jobs" className="text-teal-600 font-bold hover:text-teal-700 hidden sm:block">
               View all jobs &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.length > 0 ? featuredJobs.map((job: { id: string; title: string; employer?: { email: string }; state?: string; country?: string; currency?: string; minSalary?: number }) => (
               <Link href={`/jobs?jobId=${job.id}`} key={job.id} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow group flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                     <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-blue-600" />
                     </div>
                     <span className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full">Featured</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                     <Building2 className="w-4 h-4" />
                     {job.employer?.email ? job.employer.email.split('@')[0] : 'Confidential'}
                  </div>
                  
                  <div className="mt-auto border-t border-gray-50 pt-4 flex items-center justify-between">
                     <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.state || job.country}
                     </div>
                     <span className="text-sm font-bold text-gray-900">
                        {job.currency} {job.minSalary ? job.minSalary.toLocaleString() : 'Negotiable'}
                     </span>
                  </div>
               </Link>
            )) : (
              <div className="col-span-full border border-dashed border-gray-200 p-12 rounded-2xl bg-white text-center text-gray-500">
                No featured jobs available at the moment.
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
             <Link href="/jobs" className="text-teal-600 font-bold hover:text-teal-700">
               View all jobs &rarr;
             </Link>
          </div>
        </div>
      </section>

      {/* Industry Grid */}
      <section className="bg-white py-20">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Explore by Industry</h2>
            <p className="text-gray-500 mb-12">Find specialist roles matching your career path.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
               {INDUSTRIES.map((ind) => (
                 <Link href={`/jobs?industry=${encodeURIComponent(ind.name)}`} key={ind.name} className="border border-gray-100 p-8 rounded-2xl bg-white hover:border-teal-500 hover:shadow-lg transition flex flex-col items-center group">
                    <div className="bg-teal-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                       {ind.icon}
                    </div>
                    <h3 className="font-bold text-gray-900">{ind.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{ind.jobs} Jobs</p>
                 </Link>
               ))}
            </div>
         </div>
      </section>

      {/* Platform Stats */}
      <section className="bg-[#0D1B2A] py-16 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10">
           <ShieldCheck className="w-96 h-96 text-white" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <span className="block text-4xl font-bold text-[#1D9E75] mb-2">100+</span>
              <span className="text-sm uppercase tracking-widest text-gray-400 font-medium">Active Jobs</span>
            </div>
            <div className="text-center border-l border-white/10">
              <span className="block text-4xl font-bold text-[#1D9E75] mb-2">50+</span>
              <span className="text-sm uppercase tracking-widest text-gray-400 font-medium">Companies</span>
            </div>
            <div className="text-center border-l border-white/10 hidden md:block">
              <span className="block text-4xl font-bold text-[#1D9E75] mb-2">1k+</span>
              <span className="text-sm uppercase tracking-widest text-gray-400 font-medium">Members</span>
            </div>
            <div className="text-center border-l border-white/10 hidden md:block">
              <span className="block text-4xl font-bold text-[#1D9E75] mb-2">200+</span>
              <span className="text-sm uppercase tracking-widest text-gray-400 font-medium">Salaries</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
