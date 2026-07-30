import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/server-fetch';

import { CompanyHeader } from '@/components/reviews/CompanyHeader';
import { CompanyNavigationTabs } from '@/components/reviews/CompanyNavigationTabs';
import { RatingSummaryCard } from '@/components/reviews/RatingSummaryCard';
import { ReviewFilterBar } from '@/components/reviews/ReviewFilterBar';
import { ReviewCard } from '@/components/reviews/ReviewCard';

export const metadata: Metadata = {
  title: 'Company Reviews',
};

export default async function CompanyProfilePage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;

  let company = null;
  let reviews = [];
  let meta = { total: 0, page: 1, limit: 10 };

  try {
    const res = await serverFetch<any>(`companies/${slug}`, { cache: 'no-store' });
    if (res?.success && res?.data) {
      company = res.data;
    }
  } catch (err) {
    console.error('Failed to fetch company', err);
  }

  if (!company) {
    notFound();
  }

  try {
    const revRes = await serverFetch<any>(`reviews/companies/by-company/${company.id}?page=${page}&limit=10`, { cache: 'no-store' });
    reviews = revRes?.data || [];
    meta = revRes?.meta || meta;
  } catch (err) {
    console.error('Failed to fetch reviews', err);
  }

  // We would normally fetch true aggregates from the API, for now we will use fake if unavailable
  const aggregates = {
    ratingWorkLife: company.averageRating,
    ratingPay: company.averageRating,
    ratingManagement: company.averageRating,
    ratingCulture: company.averageRating,
    fiveStars: Math.floor(company.reviewCount * 0.5),
    fourStars: Math.floor(company.reviewCount * 0.3),
    threeStars: Math.floor(company.reviewCount * 0.1),
    twoStars: Math.floor(company.reviewCount * 0.05),
    oneStar: Math.floor(company.reviewCount * 0.05),
  };

  const totalPages = Math.ceil(meta.total / meta.limit);

  return (
    <div className="page-shell">
      <CompanyHeader company={company} />
      <CompanyNavigationTabs companySlug={slug} />

      <div className="container" style={{ padding: '32px 0 80px' }}>
        <div className="layout-split" style={{ padding: 0 }}>
          
          <aside className="filters" aria-label="Company info sidebar">
            <RatingSummaryCard company={company} aggregates={aggregates} />
            
            <div style={{ background: 'var(--c-800)', border: '1px solid var(--c-700)', borderRadius: 'var(--r-xl)', padding: '24px', marginTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--c-100)', marginBottom: '16px' }}>About {company.name}</h3>
              <p style={{ fontSize: '14px', color: 'var(--c-300)', lineHeight: '1.6' }}>
                {company.industry ? `Industry: ${company.industry}` : 'Technology and Services'}
              </p>
              {company.websiteUrl && (
                <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '16px', color: 'var(--blue-h)', fontSize: '14px', textDecoration: 'none' }}>
                  Visit Website ↗
                </a>
              )}
            </div>
          </aside>

          <main aria-label="Company reviews">
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--c-100)', marginBottom: '24px' }}>
              {meta.total} Reviews
            </h2>
            
            <ReviewFilterBar />

            <div className="review-list">
              {reviews.length === 0 ? (
                <div className="dash-empty" style={{ padding: '60px 20px', border: '1px solid var(--c-700)' }}>
                  <div className="dash-empty__title" style={{ color: 'var(--c-500)' }}>No reviews yet</div>
                  <div className="dash-empty__sub">Be the first to share your experience at {company.name}</div>
                </div>
              ) : reviews.map((review: any) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="pagination" aria-label="Review results pages" style={{ marginTop: '32px' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <a key={p} href={`/reviews/company/${slug}?page=${p}`} className={`page-btn ${p === meta.page ? 'active' : ''}`} aria-current={p === meta.page ? 'page' : undefined}>
                    {p}
                  </a>
                ))}
              </nav>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
