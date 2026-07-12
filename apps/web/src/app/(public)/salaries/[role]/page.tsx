import Link from "next/link";
import { serverFetch } from "@/lib/server-fetch";

function formatMoney(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return num.toString();
}

export default async function SalaryRolePage({ params }: { params: { role: string } }) {
  // Decode role from URL (e.g., product-manager -> Product Manager)
  const roleName = params.role
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  let aggregates: any[] = [];
  let recentSubmissions: any[] = [];
  
  try {
    const [aggRes, recentRes] = await Promise.all([
      serverFetch<any>(`salaries/aggregates?role=${encodeURIComponent(roleName)}`, { cache: 'no-store' }),
      serverFetch<any>(`salaries?role=${encodeURIComponent(roleName)}&limit=10`, { cache: 'no-store' })
    ]);
    aggregates = aggRes?.data || [];
    recentSubmissions = recentRes?.data || [];
  } catch (err) {
    // silently fail
  }

  const agg = aggregates.length > 0 ? aggregates[0] : null;
  const totalSubmissions = agg ? agg.totalSubmissions : 0;
  const avgSalary = agg ? Number(agg.avgSalary) : 0;
  const minSalary = agg ? Number(agg.minSalary) : 0;
  const maxSalary = agg ? Number(agg.maxSalary) : 0;
  const currency = agg?.currency === 'NGN' ? '₦' : agg?.currency === 'USD' ? '$' : agg?.currency === 'GBP' ? '£' : agg?.currency === 'EUR' ? '€' : (agg?.currency || '₦');
  const salaryPeriod = agg?.salaryPeriod || 'monthly';

  return (
    <div className="pt-10 pb-20">
      <div className="max-w-layout-xl mx-auto px-6 pt-7">
        
        <nav className="flex items-center gap-2 text-sm text-c500 mb-6" aria-label="Breadcrumb">
          <Link href="/salaries" className="text-c400 hover:text-c200 transition-colors duration-150">
            Salaries
          </Link>
          <span>/</span>
          <span className="text-c200">{roleName}</span>
        </nav>

        <div className="flex items-end justify-between flex-wrap gap-5 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-c100 tracking-tight">{roleName} salary</h1>
            <div className="text-sm text-c500 mt-1">📍 Nigeria &middot; {totalSubmissions} reports</div>
          </div>
          <Link href="/salaries/submit" className="bg-blue hover:bg-blueH text-white font-medium py-2 px-6 rounded-md shadow-glow-blue transition-all duration-200">
            Add Your Salary
          </Link>
        </div>

        {totalSubmissions > 0 ? (
          <>
            <div className="bg-c800 border border-c700 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <div className="text-base font-bold text-white mb-1">Average {salaryPeriod} salary</div>
                  <div className="text-sm text-c400">All experience levels &middot; Nigeria</div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-c100 tracking-tight leading-none">{currency}{formatMoney(avgSalary)}</div>
                  <div className="text-xs font-medium text-c500 mt-1 uppercase tracking-wider">per {salaryPeriod.replace('ly', '')}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-6">
                <div className="bg-c700 rounded-md p-3 text-center">
                  <div className="text-xs text-c500 uppercase tracking-wider mb-1">Minimum</div>
                  <div className="font-mono text-base font-semibold text-c100">{currency}{formatMoney(minSalary)}</div>
                </div>
                <div className="bg-green bg-opacity-20 border border-green border-opacity-40 rounded-md p-3 text-center">
                  <div className="text-xs text-green uppercase tracking-wider mb-1">Average</div>
                  <div className="font-mono text-base font-semibold text-green">{currency}{formatMoney(avgSalary)}</div>
                </div>
                <div className="bg-c700 rounded-md p-3 text-center">
                  <div className="text-xs text-c500 uppercase tracking-wider mb-1">Maximum</div>
                  <div className="font-mono text-base font-semibold text-c100">{currency}{formatMoney(maxSalary)}</div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-c700 border border-c600 text-c200 text-xs font-medium px-2 py-1 rounded-full">
                  {totalSubmissions} data points
                </span>
              </div>
            </div>

            <div className="text-lg font-bold text-c100 mt-8 mb-4">Recent Submissions</div>
            <div className="bg-c800 border border-c700 rounded-lg overflow-hidden mb-16">
              {recentSubmissions.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-c900 border-b border-c700 text-left">
                      <th className="py-3 px-4 text-xs font-semibold text-c400 uppercase tracking-wider">Role</th>
                      <th className="py-3 px-4 text-xs font-semibold text-c400 uppercase tracking-wider">Experience</th>
                      <th className="py-3 px-4 text-xs font-semibold text-c400 uppercase tracking-wider text-right">Base Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSubmissions.map((sub: any, i: number) => (
                      <tr key={i} className="border-b border-c700 last:border-b-0 hover:bg-c700/30 transition-colors">
                        <td className="py-3 px-4 text-sm text-c100 font-medium">{sub.role}</td>
                        <td className="py-3 px-4 text-sm text-c400">{sub.yearsOfExperience || 'N/A'} yrs</td>
                        <td className="py-3 px-4 font-mono text-right text-green font-semibold text-sm">
                          {sub.currency}{formatMoney(Number(sub.salaryAmount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-c400 text-sm">No recent submissions found.</div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-c800 border border-c700 rounded-lg p-12 text-center mb-16">
            <h3 className="text-lg font-semibold text-white mb-2">Not enough data</h3>
            <p className="text-c400 text-sm mb-6 max-w-md mx-auto">
              We don't have enough salary reports for <strong>{roleName}</strong> yet. Contribute your anonymous salary to help others understand the market!
            </p>
            <Link href="/salaries/submit" className="inline-block bg-blue hover:bg-blueH text-white font-medium py-2 px-6 rounded-md shadow-glow-blue transition-all duration-200">
              Submit Salary Anonymously
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
