'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Loader2, Search, Building2 } from 'lucide-react';

export default function WriteReviewSelectCompanyPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for autocomplete
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get(`/companies?search=${encodeURIComponent(query)}&limit=5`);
        setSuggestions(data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/companies/find-or-create', { name: query });
      if (data?.success && data?.data) {
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
          <div className="form-field" ref={wrapperRef} style={{ position: 'relative' }}>
            <label className="form-label" htmlFor="r-company">Company name<span className="required">*</span></label>
            <div style={{ position: 'relative' }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-c400 w-4 h-4" />
              <input 
                type="text" 
                className="input" 
                style={{ paddingLeft: '36px' }}
                id="r-company" 
                value={query} 
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }} 
                onFocus={() => setShowSuggestions(true)}
                placeholder="e.g. Paystack, Flutterwave" 
                required 
                autoComplete="off"
                autoFocus 
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-c400 w-4 h-4 animate-spin" />
              )}
            </div>

            {/* Dropdown Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '8px',
                  background: 'var(--c-800)',
                  border: '1px solid var(--c-700)',
                  borderRadius: 'var(--r-md)',
                  zIndex: 50,
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                <div style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--c-400)', fontWeight: 'bold', borderBottom: '1px solid var(--c-700)' }}>
                  Existing Companies
                </div>
                {suggestions.map((company) => (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => router.push(`/reviews/write/${company.slug}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '12px',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--c-700)',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--c-700)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--c-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Building2 className="w-4 h-4 text-c400" />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--c-100)' }}>{company.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--c-400)' }}>{company.reviewCount} reviews</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {error && (
            <div style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn--primary" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin inline" /> : null}
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
