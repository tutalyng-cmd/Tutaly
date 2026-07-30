import React from 'react';
import Link from 'next/link';

export function CompanyHeader({ company }: { company: any }) {
  const initials = company.name ? company.name.substring(0, 1).toUpperCase() : 'C';

  return (
    <div style={{ padding: '32px 0', borderBottom: '1px solid var(--c-700)', background: 'var(--c-800)' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: 'var(--r-md)', background: 'var(--c-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', color: 'var(--c-300)' }}>
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={`${company.name} logo`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--r-md)' }} />
              ) : (
                initials
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--c-100)', marginBottom: '8px' }}>
                {company.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--c-400)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--gold)' }}>★</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--c-100)' }}>{Number(company.averageRating || 0).toFixed(1)}</span>
                </div>
                <span>•</span>
                <span>{company.reviewCount} Reviews</span>
                <span>•</span>
                <span>{company.industry || 'Tech'}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href={`/reviews/write/${company.slug}`} className="btn btn--primary">
              Write a Review
            </Link>
            <button className="btn btn--ghost">Follow</button>
          </div>
        </div>
      </div>
    </div>
  );
}
