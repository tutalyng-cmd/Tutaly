'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Search, DollarSign, TrendingUp, BarChart3, ShieldCheck, MapPin, Briefcase } from 'lucide-react';

export default function SalariesPage() {
  const [salaries, setSalaries] = useState<any[]>([]);
  const [aggregates, setAggregates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ industry: '', role: '' });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.industry) queryParams.append('industry', filters.industry);
      if (filters.role) queryParams.append('role', filters.role);
      
      const [aggRes, salRes] = await Promise.all([
        api.get(`/salaries/aggregates?${queryParams.toString()}`),
        api.get(`/salaries?${queryParams.toString()}`)
      ]);
      
      setAggregates(aggRes.data?.data || []);
      setSalaries(salRes.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch salary data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      {/* Hero Section */}
      <section className="bg-navy py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4">Salary Intelligence</h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover real, anonymous compensation data across Nigerian industries. Know your worth.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-3xl mx-auto">
            <div className="flex w-full gap-2 bg-white rounded-xl p-2 shadow-lg">
              <div className="relative flex-1">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                  placeholder="Role (e.g. Frontend Engineer)" 
                  className="w-full pl-10 pr-3 py-2 border-0 focus:ring-0 text-gray-900"
                />
              </div>
              <div className="w-px bg-gray-200 my-2"></div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  name="industry"
                  value={filters.industry}
                  onChange={handleFilterChange}
                  placeholder="Industry (e.g. Fintech)" 
                  className="w-full pl-10 pr-3 py-2 border-0 focus:ring-0 text-gray-900"
                />
              </div>
            </div>
            <Link 
              href="/salaries/submit"
              className="w-full sm:w-auto shrink-0 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <DollarSign className="w-5 h-5" /> Share Salary
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-20 text-teal-600">
            <BarChart3 className="w-10 h-10 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* Summary Cards */}
            {aggregates.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Market Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {aggregates.slice(0, 3).map((agg, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-green-100 p-3 rounded-lg text-green-700">
                          <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{agg.salaryPeriod} Avg</p>
                          <h3 className="text-2xl font-bold text-gray-900">{agg.currency} {Number(agg.avgSalary).toLocaleString()}</h3>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 border-t pt-4">
                        <span>Min: {Number(agg.minSalary).toLocaleString()}</span>
                        <span>Max: {Number(agg.maxSalary).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-center text-gray-400 mt-3 pt-3 border-t">Based on {agg.totalSubmissions} submissions</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Table */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Submissions</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                  <ShieldCheck className="w-4 h-4 text-teal-500" /> 100% Anonymous
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-sm font-semibold uppercase tracking-wider">
                        <th className="p-4 border-b">Role & Industry</th>
                        <th className="p-4 border-b">Company</th>
                        <th className="p-4 border-b">Salary</th>
                        <th className="p-4 border-b hidden sm:table-cell">Location</th>
                        <th className="p-4 border-b text-right">Year</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {salaries.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-10 text-center text-gray-500">
                            No salary data matches your search. Be the first to share!
                          </td>
                        </tr>
                      ) : (
                        salaries.map((salary) => (
                          <tr key={salary.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                              <p className="font-semibold text-gray-900">{salary.role}</p>
                              <p className="text-xs text-gray-500">{salary.industry}</p>
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                {salary.company || 'Hidden'}
                              </span>
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-teal-700">
                                {salary.currency} {Number(salary.salaryAmount).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">per {salary.salaryPeriod}</p>
                            </td>
                            <td className="p-4 hidden sm:table-cell text-sm text-gray-600">
                              {salary.location || '-'}
                            </td>
                            <td className="p-4 text-right text-sm text-gray-500">
                              {salary.submissionYear}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}
      </section>
    </div>
  );
}
