'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

const LISTING_TYPE_MAP: Record<string, { label: string; icon: string; color: string; tagClass: string }> = {
  digital: { label: 'Digital', icon: '📄', color: 'var(--blue-10)', tagClass: 'tag--blue' },
  physical: { label: 'Physical', icon: '📦', color: 'var(--green-10)', tagClass: 'tag--green' },
  service: { label: 'Service', icon: '💼', color: 'var(--gold-10)', tagClass: 'tag--gold' },
};

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [listingType, setListingType] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [page, search, listingType]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '12');
      if (search) params.append('search', search);
      if (listingType) params.append('listingType', listingType);

      const res = await api.get(`/shop/products?${params.toString()}`);
      setProducts(res.data?.data || []);
      setTotal(res.data?.meta?.total || 0);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency?: string) => {
    const cur = currency || 'NGN';
    const locales: Record<string, string> = { NGN: 'en-NG', USD: 'en-US', EUR: 'de-DE' };
    return new Intl.NumberFormat(locales[cur] || 'en-NG', { style: 'currency', currency: cur }).format(price);
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <div className="page-header__eyebrow">Shop</div>
          <h1 className="page-header__title">Career resources built for you.</h1>
          <p className="page-header__sub">Resume templates, courses, salary reports, and guides — from people who've done it.</p>
        </div>
      </header>

      <div className="container" style={{ padding: '28px 0 80px' }}>
        <div className="category-rail" role="list" aria-label="Shop categories">
          <span 
            className={`cat-pill ${!listingType ? 'active' : ''}`} 
            role="listitem"
            onClick={() => { setListingType(''); setPage(1); }}
          >
            All
          </span>
          {Object.entries(LISTING_TYPE_MAP).map(([key, { label }]) => (
            <span 
              key={key}
              className={`cat-pill ${listingType === key ? 'active' : ''}`} 
              role="listitem"
              onClick={() => { setListingType(key); setPage(1); }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="results-bar">
          <p className="results-count"><strong>{total}</strong> resources</p>
          <div className="results-sort">
            Sort by
            <select aria-label="Sort shop items">
              <option>Bestselling</option>
              <option>Highest rated</option>
              <option>Newest</option>
              <option>Price: low to high</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--c-400)' }}>Loading resources...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--c-400)' }}>No resources found.</div>
        ) : (
          <div className="market-grid reveal visible">
            {products.map((product: any) => {
              const typeInfo = LISTING_TYPE_MAP[product.listingType] || LISTING_TYPE_MAP.digital;
              return (
                <Link key={product.id} href={`/shop/${product.id}`} className="market-card" style={{ display: 'block' }}>
                  <article>
                    <div className="market-card__thumb" style={{ background: typeInfo.color }}>
                      {typeInfo.icon}
                      {product.isBestseller && (
                        <span className={`market-card__badge ${typeInfo.tagClass}`}>Bestseller</span>
                      )}
                    </div>
                    <div className="market-card__body">
                      <div className="market-card__title">{product.title}</div>
                      <div className="market-card__seller">by {product.seller?.name || 'Tutaly Creator'}</div>
                      <div className="market-card__footer">
                        {product.pricingType === 'per_unit' ? (
                          <span className="market-card__price">{formatPrice(product.price, product.currency)}</span>
                        ) : (
                          <span className="market-card__price" style={{ fontSize: '13px', color: 'var(--gold)' }}>Custom Quote</span>
                        )}
                        <span className="market-card__rating">★ {product.rating || '4.9'} ({product.reviewCount || '0'})</span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        {total > 12 && (
          <nav className="pagination" aria-label="Shop results pages">
            <button 
              className="page-btn" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              aria-label="Previous page"
            >
              ‹
            </button>
            <button className="page-btn active" aria-current="page">{page}</button>
            <span style={{ color: 'var(--c-500)', padding: '0 4px' }}>of {Math.ceil(total / 12)}</span>
            <button 
              className="page-btn" 
              disabled={page >= Math.ceil(total / 12)}
              onClick={() => setPage(p => p + 1)}
              aria-label="Next page"
            >
              ›
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
