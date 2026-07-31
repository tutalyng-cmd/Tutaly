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
      // Create or find the company by name
      const { data } = await api.post('/companies/find-or-create', { name: query });
      
      if (data?.success && data?.data) {
        // Go to the company slug
        router.push(`/reviews/write/${data.data.slug}`);
      } else {
        setError('Could not process the company. Please try again.');
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
