'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiAuth, api } from '@/lib/api';
import {
  CreditCard, ShieldCheck, ArrowLeft, Loader2, CheckCircle2, Lock, ShoppingBag
} from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';

const CURRENCY_CONFIG: Record<string, { locale: string; currency: string }> = {
  NGN: { locale: 'en-NG', currency: 'NGN' },
  USD: { locale: 'en-US', currency: 'USD' },
  EUR: { locale: 'de-DE', currency: 'EUR' },
};

export default function CheckoutPage() {
  const router = useRouter();
  const { refreshCart } = useCart();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [products, setProducts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [gateway, setGateway] = useState<'flutterwave' | 'paystack'>('flutterwave');

  const [billingDetails, setBillingDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchCartAndUser();
  }, []);

  const fetchCartAndUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/signin?redirect=/shop/checkout');
        return;
      }

      // Fetch user profile for default billing info
      const userRes = await apiAuth.withToken(token).get('/user/me');
      const user = userRes.data?.data;
      if (user) {
        setBillingDetails(prev => ({
          ...prev,
          email: user.email || '',
        }));
      }

      // Fetch cart
      const res = await apiAuth.withToken(token).get('/shop/cart');
      const items = res.data?.data || [];
      if (items.length === 0) {
        router.push('/shop/cart');
        return;
      }

      setCartItems(items);

      // Fetch product details
      const productMap: Record<string, any> = {};
      for (const item of items) {
        try {
          const pRes = await api.get(`/shop/products/${item.productId}`);
          productMap[item.productId] = pRes.data?.data;
        } catch {
          // ignore deleted products
        }
      }
      setProducts(productMap);
    } catch (err) {
      console.error('Failed to fetch checkout data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingDetails.fullName || !billingDetails.email || !billingDetails.phone) {
      alert("Please fill in all billing details");
      return;
    }

    setCheckingOut(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await apiAuth.withToken(token || undefined).post('/shop/checkout', { 
        gateway,
        billingDetails 
      });
      const data = res.data;

      // refresh cart to empty badge
      await refreshCart();

      if (data.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        router.push(`/shop/checkout/success?orders=${encodeURIComponent(JSON.stringify(data.orders))}`);
      }
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = e as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
alert(err.response?.data?.message || 'Checkout failed. Please try again.');
      setCheckingOut(false);
    }
  };

  const formatPrice = (price: number, currency?: string) => {
    const cur = currency || 'NGN';
    const config = CURRENCY_CONFIG[cur] || CURRENCY_CONFIG.NGN;
    return new Intl.NumberFormat(config.locale, { style: 'currency', currency: config.currency }).format(price);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const product = products[item.productId];
      if (!product) return sum;
      return sum + Number(product.price) * item.quantity;
    }, 0);
  };

  const getCartCurrency = () => {
    for (const item of cartItems) {
      const product = products[item.productId];
      if (product?.currency) return product.currency;
    }
    return 'NGN';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/shop/cart" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Lock className="w-8 h-8 text-teal-600" />
          Secure Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            <form id="checkout-form" onSubmit={handleCheckout} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b">Billing Details</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. John Doe"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500" 
                    value={billingDetails.fullName}
                    onChange={e => setBillingDetails({...billingDetails, fullName: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500" 
                      value={billingDetails.email}
                      onChange={e => setBillingDetails({...billingDetails, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="e.g. +234 800 000 0000"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500" 
                      value={billingDetails.phone}
                      onChange={e => setBillingDetails({...billingDetails, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mt-10 mb-6 pb-4 border-b">Payment Method</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setGateway('flutterwave')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    gateway === 'flutterwave'
                      ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500 ring-opacity-20'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🦋</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${gateway === 'flutterwave' ? 'border-orange-500' : 'border-gray-300'}`}>
                      {gateway === 'flutterwave' && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                    </div>
                  </div>
                  <p className={`text-base font-bold mt-2 ${gateway === 'flutterwave' ? 'text-orange-700' : 'text-gray-900'}`}>Flutterwave</p>
                  <p className="text-xs text-gray-500 mt-1">Pay via Card, USSD, or Bank Transfer</p>
                </button>

                <button
                  type="button"
                  onClick={() => setGateway('paystack')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    gateway === 'paystack'
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">💳</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${gateway === 'paystack' ? 'border-blue-500' : 'border-gray-300'}`}>
                      {gateway === 'paystack' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                    </div>
                  </div>
                  <p className={`text-base font-bold mt-2 ${gateway === 'paystack' ? 'text-blue-700' : 'text-gray-900'}`}>Paystack</p>
                  <p className="text-xs text-gray-500 mt-1">Pay securely with any Naira card</p>
                </button>
              </div>

              <div className="mt-8 bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-teal-600 shrink-0" />
                <p className="text-sm text-gray-600">
                  Your payment information is encrypted and securely processed by your selected gateway. Tutaly does not store your card details.
                </p>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b flex items-center justify-between">
                Order Summary
                <Link href="/shop/cart" className="text-sm text-teal-600 font-medium hover:underline">Edit Cart</Link>
              </h3>

              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {cartItems.map((item) => {
                  const product = products[item.productId];
                  if (!product) return null;

                  return (
                    <div key={item.productId} className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        {product.imageUrls?.[0] ? (
                          <img src={product.imageUrls[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <ShoppingBag className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{product.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {formatPrice(Number(product.price) * item.quantity, product.currency)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 mb-6 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatPrice(calculateTotal(), getCartCurrency())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Platform fee</span>
                  <span className="font-medium text-gray-500">Included</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-black text-2xl text-teal-700">{formatPrice(calculateTotal(), getCartCurrency())}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={checkingOut}
                className="w-full bg-teal-600 hover:bg-teal-500 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {checkingOut ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <><Lock className="w-5 h-5" /> Place Order ({formatPrice(calculateTotal(), getCartCurrency())})</>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Escrow-protected transaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
