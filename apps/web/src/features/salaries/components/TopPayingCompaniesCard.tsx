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
    <div style={{
      background: 'var(--c-800)',
      border: '1px solid var(--c-700)',
      borderRadius: 'var(--r-lg)',
      padding: '28px 24px',
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--c-100)', marginBottom: '20px' }}>
        Top Paying Companies for {jobTitle}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {companies.map((company, index) => (
          <div key={company.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
            background: 'var(--c-900)',
            border: '1px solid var(--c-700)',
            borderRadius: 'var(--r-md)',
            transition: 'border-color 150ms',
          }} className="salary-role-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: 'var(--r-md)',
                background: 'var(--c-800)', border: '1px solid var(--c-700)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: 'var(--c-400)', fontSize: '14px',
              }}>
                {index + 1}
              </div>
              <div>
                <Link href={`/reviews/company/${company.slug}`} style={{ fontWeight: 600, color: 'var(--c-100)', fontSize: '14px' }}>
                  {company.name}
                </Link>
                <div style={{ fontSize: '11px', color: 'var(--c-500)', marginTop: '2px' }}>
                  {company.sampleSize} {company.sampleSize === 1 ? 'salary' : 'salaries'}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: 'var(--c-100)', fontSize: '15px' }}>{formatMoney(company.averagePay)}</div>
              <div style={{ fontSize: '11px', color: 'var(--c-500)' }}>Avg Base</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
