'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiAuth } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import '../shop.css';

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [payMethod, setPayMethod] = useState('paystack');

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

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Not authenticated');

      const res = await apiAuth.withToken(token).post('/shop/checkout', {
        paymentMethod: payMethod
      });
      
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

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);
  
  const currency = cartItems.length > 0 ? (cartItems[0].product?.currency || cartItems[0].currency || 'NGN') : 'NGN';
  const hasPhysical = cartItems.some(item => (item.product?.listingType || item.listingType) === 'physical');
  const delivery = hasPhysical ? 2500 : 0;
  const total = subtotal + delivery;

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
        <div className="shop-steps">
          <Link href="/shop/cart" className="step active"><span className="num">1</span> Cart</Link>
          <div className="line"></div>
          <div className="step active"><span className="num">2</span> Checkout</div>
          <div className="line"></div>
          <div className="step"><span className="num">3</span> Confirmation</div>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: 'var(--accent-red)', color: 'white', padding: '10px 16px', borderRadius: '8px', marginBottom: '20px' }}>
            {errorMsg}
          </div>
        )}

        <form className="shop-co-layout" onSubmit={handlePayment}>
          <div>
            {hasPhysical && (
              <div className="shop-form-card">
                <h3>Delivery details</h3>
                <div className="shop-form-grid full">
                  <div className="shop-field">
                    <label>Full name</label>
                    <input type="text" placeholder="First and last name" required value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="shop-field">
                    <label>Address line 1</label>
                    <input type="text" placeholder="Street address" required />
                  </div>
                </div>
                <div className="shop-form-grid">
                  <div className="shop-field">
                    <label>City</label>
                    <input type="text" placeholder="City" required />
                  </div>
                  <div className="shop-field">
                    <label>State / Province</label>
                    <input type="text" placeholder="State" required />
                  </div>
                </div>
              </div>
            )}
            
            {!hasPhysical && (
              <div className="shop-form-card">
                <h3>Contact details</h3>
                <div className="shop-field">
                  <label>Email address (for receipt & access)</label>
                  <input type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="shop-field">
                  <label>Full name</label>
                  <input type="text" placeholder="First and last name" required value={name} onChange={e => setName(e.target.value)} />
                </div>
              </div>
            )}

            <div className="shop-form-card">
              <h3>Payment method</h3>
              <div className="shop-pay-options">
                <label className={`shop-pay-option ${payMethod === 'paystack' ? 'selected' : ''}`}>
                  <input type="radio" name="paymethod" value="paystack" checked={payMethod === 'paystack'} onChange={() => setPayMethod('paystack')} />
                  <div>
                    <div>Paystack</div>
                    <div className="sub">Cards, USSD, Bank Transfer</div>
                  </div>
                </label>
                <label className={`shop-pay-option ${payMethod === 'wallet' ? 'selected' : ''}`}>
                  <input type="radio" name="paymethod" value="wallet" checked={payMethod === 'wallet'} onChange={() => setPayMethod('wallet')} disabled />
                  <div>
                    <div>Tutaly Wallet <span className="shop-wallet-badge">Insufficient funds</span></div>
                    <div className="sub">Fund your wallet to use this method.</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="shop-summary-card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', margin: '0 0 16px' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {cartItems.map((item) => {
                const product = item.product || item;
                const quantity = item.quantity || 1;
                return (
                  <div key={item.id} style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                      {product.imageUrls?.[0] ? (
                        <img src={product.imageUrls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
              <div className="shop-summary-row">
                <span>Delivery</span>
                <span className="val">{delivery ? formatPrice(delivery, currency) : 'Free'}</span>
              </div>
              <div className="shop-summary-row total">
                <span>Total</span>
                <span className="val">{formatPrice(total, currency)}</span>
              </div>
            </div>
            <button type="submit" className="shop-btn shop-btn-primary shop-btn-block" style={{ marginTop: '20px', padding: '14px' }} disabled={processing}>
              {processing ? <Loader2 size={16} className="animate-spin" /> : `Pay ${formatPrice(total, currency)}`}
            </button>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '14px' }}>
              Payments are secure and encrypted.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
