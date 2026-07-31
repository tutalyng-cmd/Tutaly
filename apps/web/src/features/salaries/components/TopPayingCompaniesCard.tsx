import React from 'react';
import Link from 'next/link';
import type { TopPayingCompany } from '../types/salary.types';

interface TopPayingCompaniesCardProps {
  companies: TopPayingCompany[];
  jobTitle: string;
}

export const TopPayingCompaniesCard: React.FC<TopPayingCompaniesCardProps> = ({ companies, jobTitle }) => {
  if (!companies || companies.length === 0) return null;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-c800 border border-c700 rounded-xl p-6 md:p-8">
      <h3 className="text-xl font-bold text-white mb-6">Top Paying Companies for {jobTitle}</h3>
      <div className="flex flex-col gap-4">
        {companies.map((company, index) => (
          <div key={company.id} className="flex items-center justify-between p-4 bg-c900 border border-c700 rounded-lg hover:border-green transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-md bg-c800 border border-c700 flex items-center justify-center font-bold text-c300 text-lg">
                {index + 1}
              </div>
              <div>
                <Link href={`/reviews/company/${company.slug}`} className="text-white font-medium hover:text-green hover:underline">
                  {company.name}
                </Link>
                <div className="text-xs text-c500 mt-1">
                  Based on {company.sampleSize} {company.sampleSize === 1 ? 'salary' : 'salaries'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-white text-lg">{formatMoney(company.averagePay)}</div>
              <div className="text-xs text-c500 mt-1">Average Base Pay</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
