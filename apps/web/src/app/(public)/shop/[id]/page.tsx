'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, apiAuth } from '@/lib/api';
import { useCart } from '@/components/providers/CartProvider';
import { Loader2, ArrowLeft, ShoppingCart, CheckCircle2 } from 'lucide-react';

export default function ShopProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { refreshCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [added, setAdded] = useState(false);

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

  const handleAddToCart = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/signin');
      return;
    }

    setAddingToCart(true);
    try {
      await apiAuth.withToken(token).post('/shop/cart/items', {
        productId: product.id,
        quantity: 1
      });
      await refreshCart();
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (err) {
      console.error('Failed to add to cart', err);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/shop/checkout');
  };

  const formatPrice = (price: number, currency?: string) => {
    const cur = currency || 'NGN';
    const locales: Record<string, string> = { NGN: 'en-NG', USD: 'en-US', EUR: 'de-DE' };
    return new Intl.NumberFormat(locales[cur] || 'en-NG', { style: 'currency', currency: cur, minimumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container flex justify-center items-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-blue" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-shell">
        <div className="container py-24 text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--c-100)' }}>Product Not Found</h2>
          <p className="text-c400 mb-8">The resource you are looking for does not exist or has been removed.</p>
          <Link href="/shop" className="btn btn--primary">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const sellerName = product.seller?.profile?.companyName || product.seller?.firstName || 'Tutaly Creator';
  const typeIcons: Record<string, { icon: string; color: string; label: string }> = {
    digital: { icon: '📄', color: 'var(--blue-10)', label: 'Digital Download' },
    physical: { icon: '📦', color: 'var(--green-10)', label: 'Physical Item' },
    service: { icon: '💼', color: 'var(--gold-10)', label: 'Service' },
  };
  const typeInfo = typeIcons[product.listingType] || typeIcons.digital;

  return (
    <div className="page-shell min-h-screen">
      <div className="container max-w-6xl mx-auto px-5 py-10">
        
        <Link href="/shop" className="inline-flex items-center text-sm font-semibold hover:underline mb-8" style={{ color: 'var(--blue-l)' }}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Image/Icon & Details */}
          <div className="lg:col-span-8 space-y-8">
            <div className="w-full aspect-video rounded-2xl flex items-center justify-center relative overflow-hidden bg-c800 border border-c700">
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
              <div style={{ fontSize: '8rem', zIndex: 10 }}>{typeInfo.icon}</div>
              {product.isBestseller && (
                <div className="absolute top-6 left-6 tag tag--blue z-20">Bestseller</div>
              )}
            </div>

            <div className="rounded-2xl p-8 bg-c800 border border-c700">
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--c-100)' }}>About this resource</h2>
              
              <div className="prose prose-invert max-w-none text-sm leading-relaxed" style={{ color: 'var(--c-300)' }}>
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br />') }} />
                ) : (
                  <p>No detailed description provided for this resource.</p>
                )}
              </div>
            </div>
            
            <div className="rounded-2xl p-8 bg-c800 border border-c700">
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--c-100)' }}>About the Creator</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: 'var(--blue-10)', color: 'var(--blue)' }}>
                  {sellerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-base" style={{ color: 'var(--c-100)' }}>{sellerName}</div>
                  <div className="text-xs" style={{ color: 'var(--c-400)' }}>Tutaly Verified Seller</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Card */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl p-6 lg:p-8 sticky top-24 shadow-2xl bg-c800 border border-c700">
              
              <div className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--c-400)' }}>
                {typeInfo.label}
              </div>
              
              <h1 className="text-2xl font-extrabold mb-4 leading-tight" style={{ color: 'var(--c-100)' }}>
                {product.title}
              </h1>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-gold">
                  {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--c-100)' }}>4.9</span>
                <span className="text-sm" style={{ color: 'var(--c-500)' }}>(1,204 reviews)</span>
              </div>

              <div className="text-4xl font-black font-mono mb-8" style={{ color: 'var(--green)' }}>
                {product.pricingType === 'per_unit' ? formatPrice(product.price, product.currency) : 'Custom Quote'}
              </div>

              <div className="space-y-3 mb-8">
                <button 
                  onClick={handleBuyNow}
                  className="btn btn--primary w-full py-4 text-base shadow-lg hover:shadow-xl"
                  disabled={addingToCart}
                >
                  Buy Now
                </button>
                
                <button 
                  onClick={handleAddToCart}
                  className="btn btn--ghost w-full py-4 text-base border-2"
                  disabled={addingToCart}
                  style={{ borderColor: 'var(--c-600)' }}
                >
                  {addingToCart ? (
                    <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                  ) : added ? (
                    <span className="flex items-center justify-center text-green"><CheckCircle2 className="w-5 h-5 mr-2" /> Added</span>
                  ) : (
                    <span className="flex items-center justify-center"><ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart</span>
                  )}
                </button>
              </div>

              <ul className="space-y-4 text-sm" style={{ color: 'var(--c-300)' }}>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--green)' }} />
                  <span>Instant access after payment</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--green)' }} />
                  <span>Verified seller guarantee</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--green)' }} />
                  <span>Secure Paystack checkout</span>
                </li>
              </ul>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
