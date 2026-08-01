'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Heart, FileText, Package, Briefcase } from 'lucide-react';
import './shop.css';

const LISTING_TYPE_MAP: Record<string, { label: string; icon: React.ElementType; color: string; iconColor: string; tagClass: string }> = {
  digital: { label: 'Digital', icon: FileText, color: 'var(--blue-10)', iconColor: 'var(--blue)', tagClass: 'tag--blue' },
  physical: { label: 'Physical', icon: Package, color: 'var(--green-10)', iconColor: 'var(--green)', tagClass: 'tag--green' },
  service: { label: 'Service', icon: Briefcase, color: 'var(--gold-10)', iconColor: 'var(--gold)', tagClass: 'tag--gold' },
};

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [listingType, setListingType] = useState('All');
  
  // Filters
  const [priceRange, setPriceRange] = useState(60000);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sort, setSort] = useState('bestselling');

  useEffect(() => {
    fetchProducts();
  }, [page, search, listingType, priceRange, ratingFilter, sort]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '12');
      if (search) params.append('search', search);
      
      let mappedType = '';
      if (listingType === 'Digital') mappedType = 'digital';
      if (listingType === 'Physical') mappedType = 'physical';
      if (listingType === 'Service') mappedType = 'service';
      if (mappedType) params.append('listingType', mappedType);

      // In a real app we'd pass price/rating to API, but here we just fetch and let the API handle what it can
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
    return new Intl.NumberFormat(locales[cur] || 'en-NG', { style: 'currency', currency: cur, minimumFractionDigits: 0 }).format(price);
  };

  const starString = (r: number) => {
    const full = Math.round(r || 0);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  };

  return (
    <div className="shop-view">
      <div className="shop-wrap">
        <div className="shop-hero">
          <div className="shop-eyebrow"><span className="dash"></span>Shop</div>
          <h1 className="shop-title">Career resources built for you.</h1>
          <p className="shop-subtitle">Resume templates, courses, salary reports, and guides — from people who've done it.</p>
        </div>

        <div className="shop-pills">
          {['All', 'Digital', 'Physical', 'Service'].map(t => (
            <button 
              key={t}
              className={`shop-pill ${listingType === t ? 'active' : ''}`}
              onClick={() => { setListingType(t); setPage(1); }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="shop-toolbar">
          <div className="shop-result-count"><b>{total}</b> resources</div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="shop-btn shop-btn-ghost shop-filter-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>Filters</button>
            <div className="shop-sortbox">
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="bestselling">Bestselling</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        <div className="shop-layout">
          <aside className={`shop-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="shop-filter-group">
              <div className="shop-filter-title">Career stage</div>
              <label className="shop-filter-row"><input type="checkbox" className="stageFilter" value="Entry-level" /> Entry-level</label>
              <label className="shop-filter-row"><input type="checkbox" className="stageFilter" value="Mid-level" /> Mid-level</label>
              <label className="shop-filter-row"><input type="checkbox" className="stageFilter" value="Executive" /> Executive</label>
            </div>
            <div className="shop-filter-group">
              <div className="shop-filter-title">Price</div>
              <input type="range" min="0" max="60000" step="1000" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="price-range" />
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '6px' }}>Up to <span id="priceLabel">₦{priceRange.toLocaleString()}</span></div>
            </div>
            <div className="shop-filter-group">
              <div className="shop-filter-title">Rating</div>
              <label className="shop-filter-row"><input type="radio" name="ratingFilter" value="0" checked={ratingFilter === 0} onChange={() => setRatingFilter(0)} /> Any rating</label>
              <label className="shop-filter-row"><input type="radio" name="ratingFilter" value="4.5" checked={ratingFilter === 4.5} onChange={() => setRatingFilter(4.5)} /> 4.5 &amp; up</label>
              <label className="shop-filter-row"><input type="radio" name="ratingFilter" value="4.8" checked={ratingFilter === 4.8} onChange={() => setRatingFilter(4.8)} /> 4.8 &amp; up</label>
            </div>
          </aside>

          <div>
            {loading ? (
              <div style={{ color: 'var(--text-secondary)', padding: '40px 0' }}>Loading resources...</div>
            ) : products.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', padding: '40px 0' }}>No resources match these filters.</div>
            ) : (
              <div className="shop-grid">
                {products.map((product) => {
                  const typeInfo = LISTING_TYPE_MAP[product.listingType] || LISTING_TYPE_MAP.digital;
                  const MainIcon = typeInfo.icon;
                  const isBestseller = product.isBestseller;
                  return (
                    <div key={product.id} className="shop-card">
                      <Link href={`/shop/${product.id}`}>
                        <div className="shop-card-media">
                          {isBestseller && <span className="shop-badge bestseller">Bestseller</span>}
                          <button className="shop-wishlist" onClick={(e) => { e.preventDefault(); e.currentTarget.classList.toggle('active'); }}>
                            <Heart size={15} />
                          </button>
                          {product.imageUrls?.[0] ? (
                            <img src={product.imageUrls[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <MainIcon className="main-icon" />
                          )}
                        </div>
                      </Link>
                      <div className="shop-card-body">
                        <div className="shop-card-cat">{product.category || 'Category'} · {typeInfo.label}</div>
                        <Link href={`/shop/${product.id}`} className="shop-card-title">{product.title}</Link>
                        <div className="shop-card-seller">by {product.seller?.profile?.companyName || product.seller?.firstName || 'Tutaly Creator'}</div>
                        <div className="shop-rating"><span className="shop-stars">{starString(product.rating || 4.9)}</span> {(product.rating || 4.9).toFixed(1)} ({product.reviewCount || 0})</div>
                        <div className="shop-price-row">
                          <span className="shop-price">{product.pricingType === 'per_unit' ? formatPrice(product.price, product.currency) : 'Custom Quote'}</span>
                        </div>
                        <div className="shop-card-actions">
                          <button className="shop-add-btn" onClick={(e) => {
                            e.preventDefault();
                            const btn = e.currentTarget;
                            btn.textContent = 'Added ✓';
                            btn.classList.add('added');
                            setTimeout(() => { btn.textContent = 'Add to cart'; btn.classList.remove('added'); }, 1400);
                          }}>Add to cart</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {total > 12 && (
              <div style={{ marginTop: '30px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button className="shop-btn shop-btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                <button className="shop-btn shop-btn-primary">{page}</button>
                <button className="shop-btn shop-btn-ghost" disabled={page >= Math.ceil(total / 12)} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
