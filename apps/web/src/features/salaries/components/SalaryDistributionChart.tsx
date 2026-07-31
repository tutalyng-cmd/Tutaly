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

  const totalRange = stats.max_pay - stats.min_pay;
  const p25Left = totalRange === 0 ? 25 : ((stats.p25_pay - stats.min_pay) / totalRange) * 100;
  const p75Right = totalRange === 0 ? 75 : ((stats.p75_pay - stats.min_pay) / totalRange) * 100;
  const medianPosition = totalRange === 0 ? 50 : ((stats.median_pay - stats.min_pay) / totalRange) * 100;

  return (
    <div style={{
      background: 'var(--c-800)',
      border: '1px solid var(--c-700)',
      borderRadius: 'var(--r-lg)',
      padding: '28px 32px',
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--c-100)', marginBottom: '24px' }}>Pay Distribution</h3>

      <div style={{ marginBottom: '48px' }}>
        {/* Bar */}
        <div style={{ position: 'relative', height: '14px', background: 'var(--c-900)', borderRadius: 'var(--r-pill)' }}>
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${p25Left}%`, width: `${p75Right - p25Left}%`,
            background: 'rgba(27,79,158,0.3)', borderRadius: 'var(--r-pill)',
          }} />
          <div style={{
            position: 'absolute', top: '50%',
            left: `${medianPosition}%`,
            width: '12px', height: '18px',
            background: 'var(--blue)',
            borderRadius: 'var(--r-sm)',
            transform: 'translate(-50%, -50%)',
            boxShadow: 'var(--glow-blue)',
          }} />
        </div>

        {/* Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', position: 'relative' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--c-400)' }}>Low</div>
            <div style={{ fontSize: '13px', color: 'var(--c-300)' }}>{formatMoney(stats.min_pay)}</div>
          </div>
          <div style={{ position: 'absolute', left: `${medianPosition}%`, transform: 'translateX(-50%)', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--c-100)' }}>Median</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--c-100)' }}>{formatMoney(stats.median_pay)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--c-400)' }}>High</div>
            <div style={{ fontSize: '13px', color: 'var(--c-300)' }}>{formatMoney(stats.max_pay)}</div>
          </div>
        </div>
      </div>

      {/* Summary grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
        borderTop: '1px solid var(--c-700)', paddingTop: '20px',
      }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--c-500)', marginBottom: '4px' }}>Bottom 25%</div>
          <div style={{ fontWeight: 600, color: 'var(--c-100)', fontSize: '14px' }}>{formatMoney(stats.p25_pay)}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--c-500)', marginBottom: '4px' }}>Median (50%)</div>
          <div style={{ fontWeight: 600, color: 'var(--c-100)', fontSize: '14px' }}>{formatMoney(stats.median_pay)}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--c-500)', marginBottom: '4px' }}>Top 75%</div>
          <div style={{ fontWeight: 600, color: 'var(--c-100)', fontSize: '14px' }}>{formatMoney(stats.p75_pay)}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--c-500)', marginBottom: '4px' }}>Submissions</div>
          <div style={{ fontWeight: 600, color: 'var(--c-100)', fontSize: '14px' }}>{stats.sample_count}</div>
        </div>
      </div>
    </div>
  );
};
