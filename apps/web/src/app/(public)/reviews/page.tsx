import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Company Reviews',
  description: 'Read anonymous reviews from verified employees. Discover real company culture across Nigerian industries on Tutaly.',
};

import { serverFetch } from '@/lib/server-fetch';
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

export default async function ReviewsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;

  let reviews = [];
  let meta = { total: 0, page: 1, limit: 10 };

  try {
    const res = await serverFetch<any>(`reviews/companies/all/recent?page=${page}&limit=10`, { cache: 'no-store' });
    reviews = res?.data || [];
    meta = res?.meta || meta;
  } catch (err) {
    console.error('Failed to fetch reviews', err);
  }

  const COLORS = [
    { background: 'rgba(29,122,58,0.2)', color: '#2DB85A' },
    { background: 'rgba(27,79,158,0.2)', color: 'var(--blue-l)' },
    { background: 'rgba(201,162,39,0.2)', color: 'var(--gold-h)' }
  ];

  const totalPages = Math.ceil(meta.total / meta.limit);

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <div className="page-header__eyebrow">Company reviews</div>
          <h1 className="page-header__title">The honest version of the job description.</h1>
          <p className="page-header__sub">12,000+ companies. Real reviews from real employees, anonymous by default.</p>
          <form action="/reviews/search" className="company-search" role="search" aria-label="Company search" style={{ marginTop: '20px' }}>
            <input
              type="text"
              name="q"
              placeholder="Search a company..."
              aria-label="Search companies"
              required
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </header>

      <div className="container" style={{ padding: '32px 0 80px' }}>
        <div className="layout-split" style={{ padding: 0 }}>

          {/* FILTERS */}
          <aside className="filters" aria-label="Review filters">
            <div className="filters__header">
              <span className="filters__title">Filters</span>
              <span className="filters__clear">Clear all</span>
            </div>
            <div className="filter-group">
              <div className="filter-group__label">Rating</div>
              <label className="filter-option checked"><span className="filter-checkbox"></span> 4★ &amp; up <span className="filter-count">4,210</span></label>
              <label className="filter-option"><span className="filter-checkbox"></span> 3★ &amp; up <span className="filter-count">7,840</span></label>
              <label className="filter-option"><span className="filter-checkbox"></span> Any rating <span className="filter-count">12,000</span></label>
            </div>
            <div className="filter-group">
              <div className="filter-group__label">Industry</div>
              <label className="filter-option"><span className="filter-checkbox"></span> Fintech <span className="filter-count">2,140</span></label>
              <label className="filter-option"><span className="filter-checkbox"></span> Tech &amp; Software <span className="filter-count">3,620</span></label>
              <label className="filter-option"><span className="filter-checkbox"></span> Healthcare <span className="filter-count">980</span></label>
              <label className="filter-option"><span className="filter-checkbox"></span> Logistics <span className="filter-count">740</span></label>
            </div>
            <div className="filter-group">
              <div className="filter-group__label">Company size</div>
              <label className="filter-option"><span className="filter-checkbox"></span> Startup <span className="filter-count">5,200</span></label>
              <label className="filter-option"><span className="filter-checkbox"></span> Mid-size <span className="filter-count">4,100</span></label>
              <label className="filter-option"><span className="filter-checkbox"></span> Enterprise <span className="filter-count">2,700</span></label>
            </div>
          </aside>

          {/* REVIEW LIST */}
          <main aria-label="Company reviews">
            <div className="results-bar">
              <p className="results-count"><strong>{meta.total}</strong> reviews</p>
              <div className="results-sort">
                Sort by
                <select aria-label="Sort reviews">
                  <option>Highest rated</option>
                  <option>Most reviewed</option>
                  <option>Recently added</option>
                </select>
              </div>
            </div>

            <div className="review-list">
              {reviews.length === 0 ? (
                <div className="dash-empty" style={{ padding: '60px 20px', border: '1px solid var(--c-700)' }}>
                  <div className="dash-empty__title" style={{ color: 'var(--c-500)' }}>No reviews yet</div>
                </div>
              ) : reviews.map((review: any, index: number) => {
                const logoStyle = COLORS[index % COLORS.length];
                const initials = review.companyName ? review.companyName.substring(0, 1).toUpperCase() : 'C';
                const datePosted = new Date(review.createdAt).toLocaleDateString();

                return (
                  <article key={review.id} className="review-full reveal visible">
                    <div className="review-full__head">
                      <div className="review-full__company-row">
                        <div
                          className="review-card__logo"
                          style={{ ...logoStyle, width: '48px', height: '48px', fontSize: '17px' }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="review-card__company" style={{ fontSize: '16px' }}>{review.companyName}</div>
                          <div className="review-card__stars" aria-label={`Rating: ${review.ratingOverall} out of 5`}>
                            <StarRating rating={Number(review.ratingOverall) || 0} />
                            <span className="review-card__score">{review.ratingOverall}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`badge ${review.recommend ? 'badge-success' : 'badge-danger'}`}>
                        {review.recommend ? 'Recommends' : 'Does not recommend'}
                      </span>
                    </div>
                    <div className="review-full__title">&ldquo;{review.title}&rdquo;</div>
                    <div className="review-full__body">
                      <div className="review-pro">
                        <span className="review-pro__label">Pros</span>
                        {review.pros}
                      </div>
                      <div className="review-con">
                        <span className="review-con__label">Cons</span>
                        {review.cons}
                      </div>
                    </div>
                    <div className="review-full__footer">
                      <span>{review.department} · {review.location}</span>
                      <span>Posted {datePosted}</span>
                    </div>
                  </article>
                );
              })}
            </div>

            {totalPages > 1 && (
              <nav className="pagination" aria-label="Review results pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <a key={p} href={`/reviews?page=${p}`} className={`page-btn ${p === meta.page ? 'active' : ''}`} aria-current={p === meta.page ? 'page' : undefined}>
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
