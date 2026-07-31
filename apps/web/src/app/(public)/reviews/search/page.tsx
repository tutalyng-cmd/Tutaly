import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Search Companies | Tutaly',
  description: 'Search for companies and read anonymous reviews.',
};

import { serverFetch } from '@/lib/server-fetch';
import { ReviewGlobalSidebar } from '@/components/reviews/ReviewGlobalSidebar';

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span key={i} className={i < full ? 'star' : 'star star--empty'}>★</span>
    );
  }
  return <>{stars}</>;
}

export default async function ReviewSearchPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const q = searchParams.q as string || '';
  const industry = searchParams.industry as string || '';
  const location = searchParams.location as string || '';
  const size = searchParams.size as string || '';
  const ratingCategory = searchParams.ratingCategory as string || '';
  
  // Since we mapped "Workplace factor ratings" to string values like "Culture & values" in the UI, 
  // we would ideally map that to our specific DB columns. 
  // For now we'll just pass a general 'rating' param if one is selected.
  // In a full implementation, we would map 'Culture & values' -> ratingCulture column filter in the backend.
  const rating = ratingCategory ? '1' : ''; 

  let searchResults = [];
  let meta = { total: 0, page: 1, limit: 10 };

  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('limit', '10');
  if (q) params.set('search', q);
  if (industry) params.set('industry', industry);
  if (location) params.set('location', location);
  if (size) params.set('size', size);
  if (rating) params.set('rating', rating);

  try {
    const res = await serverFetch<any>(`companies?${params.toString()}`, { cache: 'no-store' });
    searchResults = res?.data || [];
    meta = res?.meta || meta;
  } catch (err) {
    console.error('Failed to fetch search results', err);
  }

  const COLORS = [
    { background: 'var(--green-l, rgba(29,122,58,0.2))', color: 'var(--green, #2DB85A)' },
    { background: 'var(--blue-l, rgba(27,79,158,0.2))', color: 'var(--blue-h, #1B4F9E)' },
    { background: 'var(--gold-l, rgba(201,162,39,0.2))', color: 'var(--gold-h, #C9A227)' }
  ];

  const totalPages = Math.ceil(meta.total / meta.limit);

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <Link href="/reviews" className="filters__clear" style={{ display: 'inline-block', marginBottom: '16px', textDecoration: 'none' }}>
            ← Back to Reviews
          </Link>
          <h1 className="page-header__title">Search Results</h1>
          <p className="page-header__sub">
            {q ? `Searching companies for "${q}"` : 'Exploring companies'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
            <form action="/reviews/search" className="company-search" role="search" aria-label="Company search" style={{ flex: 1, margin: 0, minWidth: '300px' }}>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search a company..."
                aria-label="Search companies"
              />
              <button type="submit">Search</button>
            </form>
          </div>
        </div>
      </header>

      <div className="container" style={{ padding: '32px 0 80px' }}>
        <div className="layout-split" style={{ padding: 0 }}>
          
          {/* FILTERS */}
          <ReviewGlobalSidebar />

          {/* SEARCH RESULTS */}
          <main aria-label="Company search results">
            <div className="results-bar">
              <p className="results-count"><strong>{meta.total}</strong> results</p>
            </div>

            <div className="review-list">
              {searchResults.length === 0 ? (
                <div className="dash-empty" style={{ padding: '60px 20px', border: '1px solid var(--c-700)' }}>
                  <div className="dash-empty__title" style={{ color: 'var(--c-500)' }}>No companies found</div>
                  <div className="dash-empty__sub">Try adjusting your filters or search term.</div>
                  <Link href="/reviews/write" className="btn btn--primary" style={{ marginTop: '24px' }}>
                    Be the first to write a review
                  </Link>
                </div>
              ) : searchResults.map((company: any, index: number) => {
                const logoStyle = COLORS[index % COLORS.length];
                const initials = company.name ? company.name.substring(0, 1).toUpperCase() : 'C';

                return (
                  <article key={company.id} className="review-full reveal visible" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="review-full__head">
                      <Link 
                        href={`/reviews/company/${company.slug}`}
                        className="review-full__company-row" 
                        style={{ textDecoration: 'none' }}
                      >
                        <div
                          className="review-card__logo"
                          style={{ ...logoStyle, width: '48px', height: '48px', fontSize: '17px' }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="review-card__company" style={{ fontSize: '18px', textDecoration: 'underline', textUnderlineOffset: '4px', fontWeight: 'bold' }}>
                            {company.name}
                          </div>
                          <div className="review-card__stars" aria-label={`Rating: ${company.averageRating} out of 5`}>
                            <StarRating rating={Number(company.averageRating) || 0} />
                            <span className="review-card__score">{Number(company.averageRating || 0).toFixed(1)}</span>
                          </div>
                        </div>
                      </Link>
                      <Link href={`/reviews/company/${company.slug}`} className="btn btn--outline" style={{ fontSize: '13px', padding: '6px 12px' }}>
                        View Company
                      </Link>
                    </div>
                    
                    <div className="review-full__footer" style={{ borderTop: 'none', paddingTop: 0 }}>
                      <span style={{ color: 'var(--c-200)' }}>
                        {company.industry || 'Various Industries'} · {company.location || 'Multiple Locations'} · {company.companySize || 'Any Size'}
                      </span>
                      <span>{company.reviewCount} Reviews</span>
                    </div>
                  </article>
                );
              })}
            </div>

            {totalPages > 1 && (
              <nav className="pagination" aria-label="Search results pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const pUrl = new URLSearchParams(params.toString());
                  pUrl.set('page', p.toString());
                  return (
                    <Link key={p} href={`/reviews/search?${pUrl.toString()}`} className={`page-btn ${p === meta.page ? 'active' : ''}`} aria-current={p === meta.page ? 'page' : undefined}>
                      {p}
                    </Link>
                  );
                })}
              </nav>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
