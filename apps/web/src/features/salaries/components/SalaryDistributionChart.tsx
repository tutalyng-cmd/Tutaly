import React from 'react';
import type { SalaryAggregate } from '../types/salary.types';

interface SalaryDistributionChartProps {
  stats: SalaryAggregate;
}

export const SalaryDistributionChart: React.FC<SalaryDistributionChartProps> = ({ stats }) => {
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumSignificantDigits: 3
    }).format(amount);
  };

  // Calculate percentages for the visual bar
  const totalRange = stats.max_pay - stats.min_pay;
  const p25Left = totalRange === 0 ? 25 : ((stats.p25_pay - stats.min_pay) / totalRange) * 100;
  const p75Right = totalRange === 0 ? 75 : ((stats.p75_pay - stats.min_pay) / totalRange) * 100;
  const medianPosition = totalRange === 0 ? 50 : ((stats.median_pay - stats.min_pay) / totalRange) * 100;

  return (
    <div className="bg-c800 border border-c700 rounded-xl p-6 md:p-8">
      <h3 className="text-xl font-bold text-white mb-6">Pay Distribution</h3>
      
      <div className="mb-12">
        <div className="relative h-4 bg-c900 rounded-full mb-2">
          {/* Main range (25th to 75th percentile) */}
          <div 
            className="absolute top-0 bottom-0 bg-green opacity-30 rounded-full"
            style={{ left: `${p25Left}%`, width: `${p75Right - p25Left}%` }}
          ></div>
          
          {/* Median marker */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-5 bg-green rounded-full shadow-lg"
            style={{ left: `${medianPosition}%`, transform: `translate(-50%, -50%)` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-c500 mt-4 relative">
          <div className="text-left">
            <div className="font-medium text-c400">Low</div>
            <div>{formatMoney(stats.min_pay)}</div>
          </div>
          
          <div className="absolute" style={{ left: `${medianPosition}%`, transform: 'translateX(-50%)' }}>
            <div className="font-bold text-white">Median</div>
            <div className="text-white">{formatMoney(stats.median_pay)}</div>
          </div>
          
          <div className="text-right">
            <div className="font-medium text-c400">High</div>
            <div>{formatMoney(stats.max_pay)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-c700">
        <div>
          <div className="text-xs text-c500 mb-1">Bottom 25%</div>
          <div className="font-medium text-white">{formatMoney(stats.p25_pay)}</div>
        </div>
        <div>
          <div className="text-xs text-c500 mb-1">Median (50%)</div>
          <div className="font-medium text-white">{formatMoney(stats.median_pay)}</div>
        </div>
        <div>
          <div className="text-xs text-c500 mb-1">Top 75%</div>
          <div className="font-medium text-white">{formatMoney(stats.p75_pay)}</div>
        </div>
        <div>
          <div className="text-xs text-c500 mb-1">Total Submissions</div>
          <div className="font-medium text-white">{stats.sample_count}</div>
        </div>
      </div>
    </div>
  );
};
