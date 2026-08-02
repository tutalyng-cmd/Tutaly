'use client';

import { toast } from 'react-hot-toast';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, apiAuth } from '@/lib/api';
import { useCart } from '@/components/providers/CartProvider';
import { Loader2, FileText, Package, Briefcase, CheckCircle2, Download, Truck } from 'lucide-react';
import '../shop.css';

const LISTING_TYPE_MAP: Record<string, { label: string; icon: React.ElementType }> = {
  digital: { label: 'Digital', icon: FileText },
  physical: { label: 'Physical', icon: Package },
  service: { label: 'Service', icon: Briefcase },
};

export default function ShopProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { refreshCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [added, setAdded] = useState(false);

  const [activeTab, setActiveTab] = useState<'desc' | 'incl' | 'rev'>('desc');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/shop/products/${id}`);
      setProduct(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to fetch product', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (): Promise<boolean> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/signin');
      return false;
    }

    setAddingToCart(true);
    try {
      await apiAuth.withToken(token).post('/shop/cart/add', {
        productId: product.id,
        quantity: qty
      });
      await refreshCart();
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
      return true;
    } catch (err) {
      console.error('Failed to add to cart', err);
      toast.error('Failed to add to cart. Please try again.');
      return false;
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const wasAdded = await handleAddToCart();
    if (wasAdded) router.push('/shop/checkout');
  };

  const formatPrice = (price: number, currency?: string) => {
    const cur = currency || 'NGN';
    const locales: Record<string, string> = { NGN: 'en-NG', USD: 'en-US', EUR: 'de-DE' };
    return new Intl.NumberFormat(locales[cur] || 'en-NG', { style: 'currency', currency: cur, minimumFractionDigits: 0 }).format(price);
  };

  const starString = (r: number) => {
    const full = Math.min(5, Math.max(0, Math.round(r || 0)));
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  };

  if (loading) {
    return (
      <div className="shop-view">
        <div className="shop-wrap" style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <Loader2 size={32} style={{ color: 'var(--accent-blue)' }} className="animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="shop-view">
        <div className="shop-wrap shop-empty-state">
          <h3>Product Not Found</h3>
          <p>The resource you are looking for does not exist or has been removed.</p>
          <Link href="/shop" className="shop-btn shop-btn-primary" style={{ marginTop: '16px' }}>Back to Shop</Link>
        </div>
      </div>
    );
  }

  const sellerName = product.seller?.profile?.companyName || product.seller?.firstName || 'Tutaly Creator';
  const typeInfo = LISTING_TYPE_MAP[product.listingType] || LISTING_TYPE_MAP.digital;
  const MainIcon = typeInfo.icon;
  const rating = Number(product.rating) || 0;
  const reviewCount = product.reviewCount || 0;
  const isPhysical = product.listingType === 'physical';
  const canPurchase = product.pricingType === 'per_unit';

  return (
    <div className="shop-view">
      <div className="shop-wrap">
        <div className="shop-crumb">
          <Link href="/shop">Shop</Link><span className="sep">/</span>
          <span>{typeInfo.label}</span><span className="sep">/</span>
          <span className="cur">{product.title}</span>
        </div>

        <div className="shop-pd-layout">
          <div>
            <div className="shop-gallery-main">
              {product.imageUrls?.[0] ? (
                <img src={product.imageUrls[activeImageIndex]} alt={product.title} />
              ) : (
                <MainIcon />
              )}
            </div>
            {product.imageUrls?.length > 1 && (
              <div className="shop-gallery-thumbs">
                {product.imageUrls.map((url: string, i: number) => (
                  <button
                    type="button"
                    key={url}
                    className={`shop-thumb ${i === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(i)}
                    aria-label={`View product image ${i + 1}`}
                    aria-pressed={i === activeImageIndex}
                  >
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  </button>
                ))}
              </div>
            )}

            <div className="shop-tabs">
              <button className={`shop-tab-btn ${activeTab === 'desc' ? 'active' : ''}`} onClick={() => setActiveTab('desc')}>Description</button>
              <button className={`shop-tab-btn ${activeTab === 'incl' ? 'active' : ''}`} onClick={() => setActiveTab('incl')}>What's included</button>
              <button className={`shop-tab-btn ${activeTab === 'rev' ? 'active' : ''}`} onClick={() => setActiveTab('rev')}>Reviews ({reviewCount})</button>
            </div>

            <div className={`shop-tab-panel ${activeTab === 'desc' ? 'active' : ''}`}>
              {product.description ? (
                <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
              ) : (
                <p>No detailed description provided for this resource.</p>
              )}
            </div>
            <div className={`shop-tab-panel ${activeTab === 'incl' ? 'active' : ''}`}>
              {product.listingType === 'digital' && <p>Download access is provided from your Orders page after payment is confirmed.</p>}
              {product.listingType === 'physical' && <p>The seller coordinates fulfillment and delivery after payment. Any delivery charge is agreed separately.</p>}
              {product.listingType === 'service' && <p>The seller contacts you through the order flow to arrange the service after payment.</p>}
            </div>
            <div className={`shop-tab-panel ${activeTab === 'rev' ? 'active' : ''}`}>
              {!product.reviews || product.reviews.length === 0 ? (
                <p>No reviews yet.</p>
              ) : (
                product.reviews.map((rev: any, idx: number) => (
                  <div key={idx} className="shop-review">
                    <div className="shop-review-avatar">
                      {rev.authorName ? rev.authorName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="shop-review-name">{rev.authorName || 'Tutaly User'}</div>
                      <div className="shop-review-date">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recently'}
                      </div>
                      <div className="shop-review-text">{rev.comment || rev.text}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="shop-section-heading">Frequently bought together</div>
            <div className="shop-related-scroll">
              <div style={{ color: 'var(--text-secondary)' }}>More items from this category will appear here.</div>
            </div>
          </div>

          <div className="shop-buybox">
            <div className="shop-pd-cat">{product.category || 'Category'} · {typeInfo.label}</div>
            <h1 className="shop-pd-title">{product.title}</h1>
            <div className="shop-pd-meta">
              {reviewCount > 0 ? (
                <span className="shop-rating"><span className="shop-stars">{starString(rating)}</span> {rating.toFixed(1)} ({reviewCount})</span>
              ) : (
                <span className="shop-rating">No reviews yet</span>
              )}
              <span className="shop-verified"><CheckCircle2 size={13} /> Tutaly seller</span>
            </div>

            <div className="shop-price-row">
              <span className="shop-price">
                {product.pricingType === 'per_unit' ? formatPrice(product.price, product.currency) : 'Custom Quote'}
              </span>
            </div>

            {isPhysical ? (
              <div className="shop-delivery-line">
                <Truck size={16} /> Delivery timing and fees are arranged with the seller
              </div>
            ) : product.listingType === 'digital' ? (
              <div className="shop-delivery-line">
                <Download size={16} /> Instant digital download after payment
              </div>
            ) : (
              <div className="shop-delivery-line">
                <Briefcase size={16} /> Service scheduling is arranged with the seller after payment
              </div>
            )}

            {canPurchase && (
              <div className="shop-qty-row">
                <span className="shop-qty-label">Quantity</span>
                <div className="shop-qty-stepper">
                  <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">−</button>
                  <span>{qty}</span>
                  <button type="button" onClick={() => setQty(qty + 1)} aria-label="Increase quantity">+</button>
                </div>
              </div>
            )}

            <div className="shop-buybox-actions">
              {canPurchase ? (
                <>
                  <button className="shop-btn shop-btn-primary shop-btn-block" onClick={handleAddToCart} disabled={addingToCart}>
                    {addingToCart ? <Loader2 size={14} className="animate-spin" /> : added ? 'Added to cart' : 'Add to cart'}
                  </button>
                  <button className="shop-btn shop-btn-gold shop-btn-block" onClick={handleBuyNow} disabled={addingToCart}>
                    Buy now
                  </button>
                </>
              ) : (
                <Link className="shop-btn shop-btn-primary shop-btn-block" href="/contact">
                  Request a quote
                </Link>
              )}
            </div>

            <div className="shop-seller-card">
              <div className="shop-seller-avatar">{sellerName.charAt(0).toUpperCase()}</div>
              <div>
                <div className="shop-seller-name">{sellerName}</div>
                <div className="shop-seller-sub">Seller on Tutaly</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
