'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiAuth } from '@/lib/api';
import { Loader2, ShieldCheck, CheckCircle2, ArrowRight, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
      const items = res.data?.items || res.data?.data || res.data || [];
      setCartItems(items);
      
      if (items.length === 0) {
        router.push('/shop/cart');
      }
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Not authenticated');

      // The backend expects to process checkout from the current user's cart
      const res = await apiAuth.withToken(token).post('/shop/checkout', {
        paymentMethod: 'paystack'
      });
      
      // If the backend returns a payment URL, redirect to it.
      // Or if it processes synchronously and returns orders, redirect to success.
      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        alert('Payment successful!');
        router.push('/seeker/orders');
      }
    } catch (e: any) {
      console.error('Checkout failed', e);
      setErrorMsg(e.response?.data?.message || e.message || 'Payment processing failed. Please try again.');
      setProcessing(false);
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
    <div className="page-shell" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Simplified Header for Checkout */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b" style={{ borderColor: 'var(--c-700)' }}>
          <Link href="/">
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--c-100)', letterSpacing: '-0.02em' }}>
              Tutaly<span style={{ color: 'var(--blue-l)' }}>.</span>
            </div>
          </Link>
          <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--c-400)' }}>
            <Lock className="w-4 h-4" /> Secure Checkout
          </div>
        </div>

        {errorMsg && (
          <div className="mb-8 rounded-xl p-4 border flex items-start" style={{ borderColor: 'var(--red)', backgroundColor: 'var(--red-10)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--red)' }}>{errorMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column: Payment Info */}
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--c-100)' }}>Payment Method</h2>
            
            <div className="p-6 rounded-2xl border mb-8" style={{ backgroundColor: 'var(--c-800)', borderColor: 'var(--blue)', boxShadow: '0 0 0 1px var(--blue)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-4 flex items-center justify-center" style={{ borderColor: 'var(--blue)', backgroundColor: 'white' }}>
                  </div>
                  <span className="font-bold text-lg" style={{ color: 'var(--c-100)' }}>Paystack</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-10 h-6 bg-c700 rounded flex items-center justify-center text-xs font-bold text-white">VISA</div>
                  <div className="w-10 h-6 bg-c700 rounded flex items-center justify-center text-xs font-bold text-white">MC</div>
                </div>
              </div>
              <p className="text-sm ml-8" style={{ color: 'var(--c-400)' }}>
                You will be redirected to Paystack to complete your purchase securely. Supports Card, Bank Transfer, and USSD.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--green-10)' }}>
                <ShieldCheck className="w-6 h-6 mt-0.5" style={{ color: 'var(--green)' }} />
                <div>
                  <h4 className="font-bold text-sm" style={{ color: 'var(--c-100)' }}>Buyer Protection Guarantee</h4>
                  <p className="text-xs mt-1" style={{ color: 'var(--c-400)' }}>Your payment is held securely in escrow and only released to the seller once you receive your order.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--c-800)' }}>
                <CheckCircle2 className="w-6 h-6 mt-0.5" style={{ color: 'var(--blue-l)' }} />
                <div>
                  <h4 className="font-bold text-sm" style={{ color: 'var(--c-100)' }}>Instant Delivery for Digital Goods</h4>
                  <p className="text-xs mt-1" style={{ color: 'var(--c-400)' }}>Digital products like templates and guides are delivered to your account immediately after payment.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div>
            <div className="rounded-2xl p-6 lg:p-8 border sticky top-10" style={{ backgroundColor: 'var(--c-800)', borderColor: 'var(--c-700)' }}>
              <div className="flex justify-between items-center mb-6 pb-4 border-b" style={{ borderColor: 'var(--c-700)' }}>
                <h3 className="text-lg font-bold" style={{ color: 'var(--c-100)' }}>Order Summary</h3>
                <Link href="/shop/cart" className="text-sm font-semibold hover:underline" style={{ color: 'var(--blue-l)' }}>Edit Cart</Link>
              </div>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {cartItems.map(item => {
                  const product = item.product || item;
                  return (
                    <div key={item.id} className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate" style={{ color: 'var(--c-100)' }}>{product.title}</div>
                        <div className="text-xs mt-1" style={{ color: 'var(--c-500)' }}>Qty: {item.quantity || 1}</div>
                      </div>
                      <div className="font-mono font-bold text-sm flex-shrink-0" style={{ color: 'var(--c-100)' }}>
                        {formatPrice(product.price, product.currency)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-3 mb-6" style={{ borderColor: 'var(--c-700)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--c-400)' }}>Subtotal</span>
                  <span className="font-mono text-sm" style={{ color: 'var(--c-100)' }}>{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--c-400)' }}>Taxes & Fees</span>
                  <span className="font-mono text-sm" style={{ color: 'var(--c-100)' }}>{formatPrice(0, currency)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t pt-6 mb-8" style={{ borderColor: 'var(--c-700)' }}>
                <span className="text-lg font-bold" style={{ color: 'var(--c-100)' }}>Total</span>
                <span className="text-2xl font-bold font-mono" style={{ color: 'var(--green)' }}>{formatPrice(subtotal, currency)}</span>
              </div>

              <button 
                onClick={handlePayment}
                disabled={processing || cartItems.length === 0}
                className="btn btn--primary w-full text-center flex justify-center py-4 text-base shadow-lg"
              >
                {processing ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                ) : (
                  <>Pay {formatPrice(subtotal, currency)} <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </button>
              
              <div className="mt-4 text-center text-xs" style={{ color: 'var(--c-500)' }}>
                By proceeding, you agree to our Terms of Service and Privacy Policy.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
