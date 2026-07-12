import Link from "next/link";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/server-fetch";

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export default async function JobDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  let job;
  try {
    job = await serverFetch<any>(`jobs/${params.id}`, { cache: 'no-store' });
  } catch (err) {
    return notFound();
  }

  if (!job) {
    return notFound();
  }

  const sym = job.currency === 'NGN' ? '₦' : job.currency === 'USD' ? '$' : job.currency === 'GBP' ? '£' : job.currency === 'EUR' ? '€' : job.currency;

  const companyInitial = job.employer?.email ? job.employer.email.substring(0, 1).toUpperCase() : 'C';
  const companyName = job.employer?.email || "Confidential Company";

  return (
    <div className="pt-10 pb-20">
      <div className="max-w-layout-xl mx-auto px-6 pt-7">
        <nav className="flex items-center gap-2 text-sm text-c500 mb-6" aria-label="Breadcrumb">
          <Link href="/jobs" className="text-c400 hover:text-c200 transition-colors duration-150">
            Jobs
          </Link>
          <span>/</span>
          <Link href={`/jobs?keyword=${encodeURIComponent(job.industry || 'Tech')}`} className="text-c400 hover:text-c200 transition-colors duration-150">
            {job.industry || 'Tech'}
          </Link>
          <span>/</span>
          <span className="text-c200">{job.title} at {companyName}</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* LEFT: JOB CONTENT */}
          <main className="flex-1">
            <div className="flex gap-5 items-start mb-10">
              <div className="w-16 h-16 rounded-md shrink-0 flex items-center justify-center text-2xl font-bold bg-blue bg-opacity-20 text-blue">
                {companyInitial}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white leading-tight mb-2 tracking-tight">
                  {job.title}
                </h1>
                <div className="text-lg text-c200 mb-4 font-medium">
                  {companyName}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-c400">
                  <span>📍 {job.area ? `${job.area}, ` : ''}{job.state}, {job.country}</span>
                  <span>🏢 {job.workMode}</span>
                  <span>👤 {job.experienceLevel}</span>
                  <span>🕐 Posted {formatTimeAgo(job.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="text-lg font-semibold text-white mb-4">About the role</div>
              <div className="text-sm text-c300 leading-relaxed space-y-4 whitespace-pre-line">
                {job.description}
              </div>
            </div>
          </main>

          {/* RIGHT: FLOATING CARD */}
          <aside className="w-full md:w-80 shrink-0 sticky top-24">
            <div className="bg-c800 border border-c700 p-6 rounded-xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                </svg>
              </div>

              <div className="text-2xl font-bold text-green font-mono mb-1">
                {sym}{job.minSalary ? job.minSalary.toLocaleString() : 'Negotiable'}
                {job.maxSalary ? ` – ${sym}${job.maxSalary.toLocaleString()}` : ''}
              </div>
              <div className="text-sm text-c400 mb-6">
                per month &middot;{" "}
                {job.role && (
                  <Link href={`/salaries/${job.role.toLowerCase().replace(/\s+/g, '-')}`} className="text-blueL hover:text-blueH transition-colors">
                    See full salary breakdown &rarr;
                  </Link>
                )}
              </div>

              <div className="flex justify-between text-sm mb-3 border-b border-c700 pb-3">
                <span className="text-c400">Applicants</span>
                <span className="text-c100 font-medium">{job.applicantsCount || 0}</span>
              </div>
              <div className="flex justify-between text-sm mb-3 border-b border-c700 pb-3">
                <span className="text-c400">Job type</span>
                <span className="text-c100 font-medium">{job.jobType}</span>
              </div>
              <div className="flex justify-between text-sm mb-6">
                <span className="text-c400">Experience</span>
                <span className="text-c100 font-medium">{job.experienceLevel}</span>
              </div>
              <button className="w-full bg-blue text-white font-medium py-3 px-4 rounded-md hover:bg-blueH transition-colors duration-200 shadow-glow-blue flex justify-center items-center">
                Apply Now
              </button>
              <button className="w-full bg-transparent text-c300 font-medium py-3 px-4 rounded-md border border-c600 hover:bg-c700 hover:text-white transition-colors duration-200 mt-2 flex justify-center items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
                Save Job
              </button>

              <div className="flex gap-3 mt-6 pt-6 border-t border-c700">
                <div className="w-10 h-10 rounded-md shrink-0 flex items-center justify-center text-base font-bold bg-blue bg-opacity-20 text-blue">
                  {companyInitial}
                </div>
                <div>
                  <div className="text-sm font-semibold text-c100 mb-1">{companyName}</div>
                  <div className="text-sm text-c400">
                    {job.employer?.reviewScore || 'No reviews yet'}
                  </div>
                </div>
              </div>
              
              {job.employer?.email && (
                <Link 
                  href={`/reviews/company/${job.employer.email.split('@')[0]}`} 
                  className="w-full bg-transparent text-c300 font-medium py-2 px-4 rounded-md border border-c600 hover:bg-c700 hover:text-white transition-colors duration-200 mt-2 flex justify-center items-center text-sm"
                >
                  Read company reviews
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
