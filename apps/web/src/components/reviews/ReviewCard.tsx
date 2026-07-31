import React from 'react';

const StarRating = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span key={i} className={i < full ? 'star' : 'star star--empty'}>★</span>
    );
  }
  return <div className="review-card__stars">{stars}</div>;
};

export function ReviewCard({ review }: { review: any }) {
  const datePosted = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  const employerResponse = review.responses && review.responses.length > 0 ? review.responses[0] : null;

  return (
    <article className="review-full reveal visible" style={{ background: 'var(--c-800)', border: '1px solid var(--c-700)', borderRadius: 'var(--r-lg)', padding: '24px', marginBottom: '24px', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
      <div className="review-full__head" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <StarRating rating={Number(review.ratingOverall) || 0} />
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--c-100)' }}>{Number(review.ratingOverall).toFixed(1)}</span>
            <span style={{ color: 'var(--c-400)', fontSize: '13px' }}>•</span>
            <span className={`badge ${review.recommend ? 'badge-success' : 'badge-danger'}`} style={{ padding: '2px 8px', fontSize: '11px', textTransform: 'uppercase' }}>
              {review.recommend ? 'Recommends' : 'Does not recommend'}
            </span>
          </div>
          <div className="review-full__title" style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--c-100)', marginBottom: '4px' }}>&ldquo;{review.title || review.reviewTitle}&rdquo;</div>
          <div style={{ fontSize: '13px', color: 'var(--c-400)' }}>
            {review.jobTitle || 'Employee'} • {review.isCurrentEmployee ? 'Current Employee' : `Former Employee${review.employmentEndYear ? ` (${review.employmentEndYear})` : ''}`}
            {review.jobLocation ? ` • ${review.jobLocation}` : ''} • {datePosted}
          </div>
        </div>
      </div>
      
      <div className="review-full__body" style={{ color: 'var(--c-300)', fontSize: '14px', lineHeight: '1.6', marginTop: '16px' }}>
        <div className="review-pro" style={{ marginBottom: '16px' }}>
          <span className="review-pro__label" style={{ display: 'block', fontWeight: 'bold', color: 'var(--green)', marginBottom: '4px' }}>Pros</span>
          {review.pros}
        </div>
        <div className="review-con" style={{ marginBottom: '16px' }}>
          <span className="review-con__label" style={{ display: 'block', fontWeight: 'bold', color: 'var(--red)', marginBottom: '4px' }}>Cons</span>
          {review.cons}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px', borderTop: '1px solid var(--c-700)', borderBottom: employerResponse ? 'none' : '1px solid var(--c-700)', padding: '16px 0', marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--c-400)' }}>Work-Life Balance</span>
          <span style={{ color: 'var(--c-200)' }}>{review.ratingWorkLife ? `${review.ratingWorkLife} ★` : 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--c-400)' }}>Pay & Benefits</span>
          <span style={{ color: 'var(--c-200)' }}>{review.ratingPay ? `${review.ratingPay} ★` : 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--c-400)' }}>Senior Management</span>
          <span style={{ color: 'var(--c-200)' }}>{review.ratingManagement ? `${review.ratingManagement} ★` : 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--c-400)' }}>Culture & Values</span>
          <span style={{ color: 'var(--c-200)' }}>{review.ratingCulture ? `${review.ratingCulture} ★` : 'N/A'}</span>
        </div>
      </div>

      {employerResponse && (
        <div style={{ background: 'var(--c-900)', borderLeft: '4px solid var(--gold)', padding: '16px', borderRadius: '0 var(--r-md) var(--r-md) 0', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--gold)' }}>Employer Response</div>
            <div style={{ fontSize: '12px', color: 'var(--c-500)' }}>{new Date(employerResponse.createdAt).toLocaleDateString()}</div>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--c-300)', lineHeight: '1.6' }}>
            {employerResponse.responseText}
          </div>
        </div>
      )}

      <div className="review-full__footer" style={{ marginTop: '16px', display: 'flex', gap: '16px', borderTop: employerResponse ? '1px solid var(--c-700)' : 'none', paddingTop: employerResponse ? '16px' : 0 }}>
        <button style={{ background: 'transparent', border: '1px solid var(--c-600)', color: 'var(--c-300)', borderRadius: 'var(--r-pill)', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>
          Helpful ({review.helpfulVotes || 0})
        </button>
        <button style={{ background: 'transparent', border: '1px solid var(--c-600)', color: 'var(--c-300)', borderRadius: 'var(--r-pill)', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>
          Report
        </button>
      </div>
    </article>
  );
}
