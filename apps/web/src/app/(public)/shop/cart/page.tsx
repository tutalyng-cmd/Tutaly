'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiAuth } from '@/lib/api';
import { Loader2, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/signin');
        return;
      }
      const res = await apiAuth.withToken(token).get('/shop/cart');
      // The API returns the list of items in the cart
      setCartItems(res.data?.items || res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      // Optimistic update
      setCartItems(prev => prev.filter(item => item.product?.id !== productId && item.productId !== productId && item.id !== productId));
      
      await apiAuth.withToken(token).delete(`/shop/cart/${productId}`);
      // Re-fetch to ensure sync
      fetchCart();
    } catch (err) {
      console.error('Failed to remove from cart', err);
      // Re-fetch on error to revert optimistic update
      fetchCart();
    }
  };

  const formatPrice = (price: number, currency?: string) => {
    const cur = currency || 'NGN';
    const locales: Record<string, string> = { NGN: 'en-NG', USD: 'en-US', EUR: 'de-DE' };
    return new Intl.NumberFormat(locales[cur] || 'en-NG', { style: 'currency', currency: cur, minimumFractionDigits: 0 }).format(price);
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);
  
  const currency = cartItems.length > 0 ? (cartItems[0].product?.currency || cartItems[0].currency || 'NGN') : 'NGN';

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container flex justify-center items-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-green" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container max-w-5xl mx-auto px-5 py-16">
        
        <div className="page-header mb-8" style={{ borderBottom: 'none' }}>
          <div className="page-header__eyebrow">Checkout Process</div>
          <h1 className="page-header__title">Your Shopping Cart</h1>
          <p className="page-header__sub">Review the items in your cart before proceeding to payment.</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border bg-c800 border-c700">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-c700">
              <ShoppingBag className="w-8 h-8" style={{ color: 'var(--c-400)' }} />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--c-100)' }}>Your cart is empty</h2>
            <p className="mb-8 max-w-sm mx-auto" style={{ color: 'var(--c-400)' }}>Looks like you haven't added any resources or templates to your cart yet.</p>
            <Link href="/shop" className="btn btn--primary">
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
            
            {/* Cart Items List */}
            <div className="lg:col-span-2">
              <div className="flex flex-col gap-4">
                {cartItems.map((item) => {
                  const product = item.product || item;
                  return (
                    <div key={item.id} className="flex gap-6 p-6 rounded-2xl border bg-c800 border-c700">
                      <div className="w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl bg-c700">
                        {product.listingType === 'digital' ? '📄' : product.listingType === 'service' ? '💼' : '📦'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="text-lg font-bold mb-1 leading-tight" style={{ color: 'var(--c-100)' }}>{product.title}</h3>
                            <div className="text-sm font-medium mb-3" style={{ color: 'var(--blue-l)' }}>by {product.seller?.profile?.companyName || product.seller?.firstName || 'Creator'}</div>
                          </div>
                          <div className="text-xl font-bold font-mono flex-shrink-0 text-right" style={{ color: 'var(--c-100)' }}>
                            {formatPrice(product.price, product.currency)}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2 pt-4 border-t" style={{ borderColor: 'var(--c-700)' }}>
                          <div className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: 'var(--c-700)', color: 'var(--c-300)' }}>
                            {product.listingType}
                          </div>
                          
                          <button 
                            onClick={() => handleRemove(product.id)}
                            className="flex items-center gap-1.5 text-sm font-semibold hover:text-red transition-colors"
                            style={{ color: 'var(--c-400)' }}
                          >
                            <Trash2 className="w-4 h-4" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl p-6 lg:p-8 sticky top-28 border bg-c800 border-c700">
                <h3 className="text-lg font-bold mb-6 pb-4 border-b border-c700" style={{ color: 'var(--c-100)' }}>Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--c-400)' }}>Subtotal ({cartItems.length} items)</span>
                    <span className="font-mono" style={{ color: 'var(--c-100)' }}>{formatPrice(subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--c-400)' }}>Taxes</span>
                    <span className="font-mono" style={{ color: 'var(--c-100)' }}>Calculated at checkout</span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t pt-6 mb-8" style={{ borderColor: 'var(--c-700)' }}>
                  <span className="text-base font-bold" style={{ color: 'var(--c-100)' }}>Estimated Total</span>
                  <span className="text-2xl font-bold font-mono" style={{ color: 'var(--green)' }}>{formatPrice(subtotal, currency)}</span>
                </div>

                <Link href="/shop/checkout" className="btn btn--primary w-full text-center flex justify-center py-4 text-base">
                  Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                
                <div className="mt-6 text-center text-xs" style={{ color: 'var(--c-500)' }}>
                  Secure checkout processed by Paystack.
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
