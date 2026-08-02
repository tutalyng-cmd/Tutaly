'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiAuth } from '@/lib/api';
import { AlertCircle, ArrowLeft, Loader2, LockKeyhole, Truck } from 'lucide-react';
import '../shop.css';

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [payMethod, setPayMethod] = useState('flutterwave');

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
      setErrorMsg('We could not load your cart. Return to your cart and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Not authenticated');

      const res = await apiAuth.withToken(token).post('/shop/checkout', {
        gateway: payMethod
      });

      const paymentLink = res.data?.paymentLink || res.data?.paymentUrl;
      if (paymentLink) {
        window.location.href = paymentLink;
      } else {
        throw new Error('The payment provider did not return a checkout link. No payment was taken.');
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

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);

  const currency = cartItems.length > 0 ? (cartItems[0].product?.currency || cartItems[0].currency || 'NGN') : 'NGN';
  const hasPhysical = cartItems.some(item => (item.product?.listingType || item.listingType) === 'physical');
  const cartCurrencies = new Set(cartItems.map(item => item.product?.currency || item.currency || 'NGN'));
  const hasMixedCurrencies = cartCurrencies.size > 1;
  const total = subtotal;

  if (loading) {
    return (
      <div className="shop-view">
        <div className="shop-wrap" style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <Loader2 size={32} style={{ color: 'var(--accent-blue)' }} className="animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="shop-view">
      <div className="shop-wrap">
        <nav className="shop-steps" aria-label="Checkout progress">
          <Link href="/shop/cart" className="step active"><span className="num">1</span> Cart</Link>
          <div className="line" aria-hidden="true"></div>
          <div className="step active" aria-current="step"><span className="num">2</span> Payment</div>
          <div className="line" aria-hidden="true"></div>
          <div className="step"><span className="num">3</span> Confirmation</div>
        </nav>

        <div className="shop-checkout-heading">
          <Link href="/shop/cart" className="shop-checkout-back"><ArrowLeft size={15} /> Back to cart</Link>
          <h1>Complete your order</h1>
          <p>Review the exact amount, choose a payment provider, then continue to its secure checkout.</p>
        </div>

        {errorMsg && (
          <div className="shop-checkout-alert error" role="alert">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {hasMixedCurrencies && (
          <div className="shop-checkout-alert error" role="alert">
            <AlertCircle size={18} />
            <span>Your cart contains more than one currency. Purchase items in each currency as a separate order.</span>
          </div>
        )}

        <form className="shop-co-layout" onSubmit={handlePayment}>
          <div>
            {hasPhysical && (
              <div className="shop-checkout-alert info">
                <Truck size={18} />
                <div>
                  <strong>Physical delivery is arranged after payment</strong>
                  <span>The seller will coordinate the address, timing, and any delivery charge through your order. Delivery is not included in today&apos;s total.</span>
                </div>
              </div>
            )}

            <div className="shop-form-card">
              <h2>Choose a payment provider</h2>
              <p className="shop-form-card__intro">You will review and authorize the transaction on the provider&apos;s secure page.</p>
              <div className="shop-pay-options">
                <label className={`shop-pay-option ${payMethod === 'flutterwave' ? 'selected' : ''}`}>
                  <input type="radio" name="paymethod" value="flutterwave" checked={payMethod === 'flutterwave'} onChange={() => setPayMethod('flutterwave')} />
                  <div>
                    <div>Flutterwave</div>
                    <div className="sub">Cards, Bank Transfer, USSD, Mobile Money</div>
                  </div>
                </label>
                <label className={`shop-pay-option ${payMethod === 'paystack' ? 'selected' : ''}`}>
                  <input type="radio" name="paymethod" value="paystack" checked={payMethod === 'paystack'} onChange={() => setPayMethod('paystack')} />
                  <div>
                    <div>Paystack</div>
                    <div className="sub">Cards, USSD, Bank Transfer</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="shop-summary-card">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', margin: '0 0 16px' }}>Order summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {cartItems.map((item) => {
                const product = item.product || item;
                const quantity = item.quantity || 1;
                return (
                  <div key={item.id} style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                      {product.imageUrls?.[0] ? (
                        <img src={product.imageUrls[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'var(--border)' }}></div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Qty: {quantity}</div>
                    </div>
                    <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formatPrice(product.price * quantity, product.currency)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: '16px' }}>
              <div className="shop-summary-row">
                <span>Subtotal</span>
                <span className="val">{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="shop-summary-row total">
                <span>Due today</span>
                <span className="val">{formatPrice(total, currency)}</span>
              </div>
            </div>
            <button type="submit" className="shop-btn shop-btn-primary shop-btn-block" style={{ marginTop: '20px', padding: '14px' }} disabled={processing || hasMixedCurrencies}>
              {processing ? <Loader2 size={16} className="animate-spin" /> : `Continue to ${payMethod === 'paystack' ? 'Paystack' : 'Flutterwave'}`}
            </button>
            <div className="shop-secure-note">
              <LockKeyhole size={13} /> Payment is completed securely with the selected provider.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
