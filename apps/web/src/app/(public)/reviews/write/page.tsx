'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function WriteReviewSelectCompanyPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      // Find company by name (search endpoint)
      // Since we don't have a dedicated search endpoint yet that returns exact matches, 
      // we can try fetching the top companies or using a search endpoint if available.
      // Assuming GET /companies?search=query exists from CompanyController
      const { data } = await api.get(`/companies?search=${encodeURIComponent(query)}`);
      const companies = data?.data || [];
      
      if (companies.length > 0) {
        // Go to the first match
        router.push(`/reviews/write/${companies[0].slug}`);
      } else {
        // We could theoretically create a company on the fly here, 
        // but for now, we'll just show an error.
        setError('Company not found. Please try another name.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while searching for the company.');
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <header className="page-header" style={{ textAlign: 'center', borderBottom: 'none' }}>
        <div className="container container--narrow">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: '16px' }}>
            <div style={{ width: '20px', height: '2px', background: 'var(--gold)' }}></div>
            Company reviews
          </div>
          <h1 className="page-header__title" style={{ marginBottom: '16px' }}>Share your experience</h1>
          <p className="page-header__sub" style={{ fontSize: '16px', maxWidth: '540px', margin: '0 auto', lineHeight: 1.6 }}>
            Help other professionals make informed decisions. First, tell us which company you'd like to review.
          </p>
        </div>
      </header>

      <div className="container" style={{ maxWidth: '480px', padding: '32px 24px 80px' }}>
        <form onSubmit={handleSearch} style={{ background: 'var(--c-800)', border: '1px solid var(--c-700)', borderRadius: 'var(--r-xl)', padding: '28px' }}>
          <div className="form-field">
            <label className="form-label" htmlFor="r-company">Company name<span className="required">*</span></label>
            <input 
              type="text" 
              className="input" 
              id="r-company" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="e.g. Paystack, Flutterwave" 
              required 
              autoFocus 
            />
          </div>
          
          {error && (
            <div style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn--primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin inline" /> : null}
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
