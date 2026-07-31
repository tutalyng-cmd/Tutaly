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
    <div style={{
      background: 'var(--c-800)',
      border: '1px solid var(--c-700)',
      borderRadius: 'var(--r-lg)',
      padding: '28px 32px',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--c-400)', marginBottom: '4px', fontWeight: 600 }}>Median Base Pay</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--c-100)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            {formatMoney(stats.median_pay)} <span style={{ fontSize: '16px', color: 'var(--c-500)', fontWeight: 400 }}>/ yr</span>
          </div>
          <div style={{
            fontSize: '12px', color: 'var(--c-500)',
            background: 'var(--c-900)', display: 'inline-block',
            padding: '4px 12px', borderRadius: 'var(--r-pill)',
            border: '1px solid var(--c-700)', marginTop: '10px',
          }}>
            Based on {stats.sample_count} {stats.sample_count === 1 ? 'submission' : 'submissions'} for {title} {stats.location !== 'ALL' ? `in ${stats.location}` : ''}
          </div>
        </div>

        <div style={{
          background: 'var(--c-900)',
          padding: '16px 20px',
          borderRadius: 'var(--r-lg)',
          border: '1px solid var(--c-700)',
          minWidth: '220px',
        }}>
          <div style={{ fontSize: '13px', color: 'var(--c-400)', marginBottom: '8px', fontWeight: 600 }}>Confidence</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: stats.sample_count > 10 ? 'var(--green)' : 'var(--gold)',
            }} />
            <span style={{ fontWeight: 600, color: 'var(--c-100)', fontSize: '14px' }}>
              {stats.sample_count > 10 ? 'High' : 'Low'} Confidence
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--c-500)', marginTop: '6px', lineHeight: 1.5 }}>
            {stats.sample_count > 10 
              ? 'Enough data points for a statistically significant estimate.'
              : 'More data needed. Consider submitting your salary.'}
          </p>
        </div>
      </div>
    </div>
  );
};
