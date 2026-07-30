import React from 'react';

const StarRow = ({ stars, count, maxCount }: { stars: number, count: number, maxCount: number }) => {
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--c-400)' }}>
      <span style={{ width: '20px', textAlign: 'right' }}>{stars}★</span>
      <div style={{ flex: 1, height: '8px', background: 'var(--c-700)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--gold)', borderRadius: '4px' }} />
      </div>
      <span style={{ width: '30px' }}>{count}</span>
    </div>
  );
};

export function RatingSummaryCard({ company, aggregates }: { company: any, aggregates: any }) {
  const overall = Number(company.averageRating || 0).toFixed(1);
  const total = company.reviewCount || 0;
  
  // Fake aggregates for UI if not provided
  const maxCount = Math.max(
    aggregates?.fiveStars || 0,
    aggregates?.fourStars || 0,
    aggregates?.threeStars || 0,
    aggregates?.twoStars || 0,
    aggregates?.oneStar || 0,
    1
  );

  return (
    <div style={{ background: 'var(--c-800)', border: '1px solid var(--c-700)', borderRadius: 'var(--r-xl)', padding: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--c-100)', marginBottom: '24px' }}>Overall Rating</h3>
      
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--c-100)', lineHeight: '1' }}>{overall}</div>
          <div style={{ color: 'var(--gold)', fontSize: '20px', margin: '4px 0' }}>★★★★★</div>
          <div style={{ fontSize: '13px', color: 'var(--c-400)' }}>{total} Reviews</div>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <StarRow stars={5} count={aggregates?.fiveStars || 0} maxCount={maxCount} />
          <StarRow stars={4} count={aggregates?.fourStars || 0} maxCount={maxCount} />
          <StarRow stars={3} count={aggregates?.threeStars || 0} maxCount={maxCount} />
          <StarRow stars={2} count={aggregates?.twoStars || 0} maxCount={maxCount} />
          <StarRow stars={1} count={aggregates?.oneStar || 0} maxCount={maxCount} />
        </div>
      </div>
      
      <div style={{ borderTop: '1px solid var(--c-700)', paddingTop: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--c-100)', marginBottom: '16px' }}>Rating by Category</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--c-400)' }}>Work-Life Balance</span>
            <span style={{ color: 'var(--c-100)', fontWeight: 'bold' }}>{Number(aggregates?.ratingWorkLife || 0).toFixed(1)} ★</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--c-400)' }}>Pay & Benefits</span>
            <span style={{ color: 'var(--c-100)', fontWeight: 'bold' }}>{Number(aggregates?.ratingPay || 0).toFixed(1)} ★</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--c-400)' }}>Senior Management</span>
            <span style={{ color: 'var(--c-100)', fontWeight: 'bold' }}>{Number(aggregates?.ratingManagement || 0).toFixed(1)} ★</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--c-400)' }}>Culture & Values</span>
            <span style={{ color: 'var(--c-100)', fontWeight: 'bold' }}>{Number(aggregates?.ratingCulture || 0).toFixed(1)} ★</span>
          </div>
        </div>
      </div>
    </div>
  );
}
