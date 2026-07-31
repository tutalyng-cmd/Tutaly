import React from 'react';
import type { SalaryAggregate } from '../types/salary.types';

interface SalaryHeroStatCardProps {
  stats: SalaryAggregate;
  title: string;
}

export const SalaryHeroStatCard: React.FC<SalaryHeroStatCardProps> = ({ stats, title }) => {
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-c800 border border-c700 rounded-xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <h2 className="text-xl text-c400 mb-1">Median Base Pay</h2>
          <div className="text-4xl md:text-5xl font-bold text-white mb-2">
            {formatMoney(stats.median_pay)} <span className="text-xl text-c500 font-normal">/ yr</span>
          </div>
          <div className="text-sm text-c500 bg-c900 inline-block px-3 py-1 rounded-full border border-c700">
            Based on {stats.sample_count} {stats.sample_count === 1 ? 'submission' : 'submissions'} for {title} {stats.location !== 'ALL' ? `in ${stats.location}` : ''}
          </div>
        </div>
        
        <div className="bg-c900 p-4 rounded-lg border border-c700 min-w-[240px]">
          <div className="text-sm text-c400 mb-2 font-medium">Confidence & Data Quality</div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${stats.sample_count > 10 ? 'bg-green' : 'bg-yellow-500'}`}></div>
            <span className="text-white font-medium">
              {stats.sample_count > 10 ? 'High Confidence' : 'Low Confidence'}
            </span>
          </div>
          <p className="text-xs text-c500 mt-2 leading-relaxed">
            {stats.sample_count > 10 
              ? 'We have enough data points to provide a statistically significant estimate for this role.'
              : 'We need more data to improve accuracy. Consider submitting your salary.'}
          </p>
        </div>
      </div>
    </div>
  );
};
