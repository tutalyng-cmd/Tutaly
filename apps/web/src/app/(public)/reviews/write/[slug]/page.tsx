import React from 'react';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/server-fetch';
import WriteReviewForm from './WriteReviewForm';

export default async function WriteReviewPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  let company = null;
  try {
    const res = await serverFetch<any>(`companies/${slug}`, { cache: 'no-store' });
    if (res?.success && res?.data) {
      company = res.data;
    }
  } catch (e) {
    //
  }

  if (!company) {
    notFound();
  }

  return (
    <div className="page-shell">
      <header className="page-header" style={{ textAlign: 'center', borderBottom: 'none' }}>
        <div className="container container--narrow">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: '16px' }}>
            <div style={{ width: '20px', height: '2px', background: 'var(--gold)' }}></div>
            Company review
          </div>
          <h1 className="page-header__title" style={{ marginBottom: '16px' }}>Rate your experience at {company.name}</h1>
          <p className="page-header__sub" style={{ fontSize: '16px', maxWidth: '540px', margin: '0 auto', lineHeight: 1.6 }}>
            Help other professionals make informed decisions. Your review is anonymous by default.
          </p>
        </div>
      </header>

      <div className="container" style={{ maxWidth: '680px', padding: '32px 24px 80px' }}>
        <WriteReviewForm company={company} />
      </div>
    </div>
  );
}
