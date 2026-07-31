'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function CompanyHeader({ company }: { company: any }) {
  const initials = company?.name ? company.name.substring(0, 1).toUpperCase() : 'C';
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div style={{ padding: '32px 0', borderBottom: '1px solid var(--c-700)', background: 'var(--c-800)' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: 'var(--r-md)', background: 'var(--c-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', color: 'var(--c-300)' }}>
              {company?.logoUrl ? (
                <img src={company.logoUrl} alt={`${company.name} logo`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--r-md)' }} />
              ) : (
                initials
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--c-100)', marginBottom: '8px' }}>
                {company?.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--c-400)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--gold)' }}>★</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--c-100)' }}>{Number(company?.averageRating || 0).toFixed(1)}</span>
                </div>
                <span>•</span>
                <span>{company?.reviewCount || 0} Reviews</span>
                <span>•</span>
                <span>{company?.industry || 'Tech'}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href={`/reviews/write/${company?.slug || ''}`} className="btn btn--primary">
              Write a Review
            </Link>
            <button 
              onClick={() => setIsFollowing(!isFollowing)}
              className="btn btn--ghost"
              style={{
                background: isFollowing ? 'var(--c-700)' : 'transparent',
                color: isFollowing ? 'var(--c-100)' : 'var(--c-300)',
                borderColor: isFollowing ? 'var(--c-600)' : 'var(--c-700)',
              }}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
