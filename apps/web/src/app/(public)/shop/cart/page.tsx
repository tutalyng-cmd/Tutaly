'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiAuth, api } from '@/lib/api';
import {
  ShoppingCart, Trash2, ArrowLeft, Loader2, CreditCard,
  ShieldCheck, Package, AlertCircle, CheckCircle2,
} from 'lucide-react';

const CURRENCY_CONFIG: Record<string, { locale: string; currency: string }> = {
  NGN: { locale: 'en-NG', currency: 'NGN' },
  USD: { locale: 'en-US', currency: 'USD' },
  EUR: { locale: 'de-DE', currency: 'EUR' },
};

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [products, setProducts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [gateway, setGateway] = useState<'flutterwave' | 'paystack'>('flutterwave');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/sign-in');
        return;
      }

      const res = await apiAuth.withToken(token).get('/shop/cart');
      const items = res.data?.data || [];
      setCartItems(items);

      // Fetch product details for each item
      const productMap: Record<string, any> = {};
      for (const item of items) {
        try {
          const pRes = await api.get(`/shop/products/${item.productId}`);
          productMap[item.productId] = pRes.data?.data;
        } catch {
          // Product might have been removed
        }
      }
      setProducts(productMap);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).delete(`/shop/cart/${productId}`);
      setCartItems(prev => prev.filter(item => item.productId !== productId));
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/sign-in');
        return;
      }

      const res = await apiAuth.withToken(token).post('/shop/checkout', { gateway });
      const data = res.data;

      if (data.paymentLink) {
        // Redirect to payment page (Flutterwave or Paystack)
        window.location.href = data.paymentLink;
      } else {
        // Gateway not configured — redirect to success with order info
        router.push(`/shop/checkout/success?orders=${encodeURIComponent(JSON.stringify(data.orders))}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Checkout failed');
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

  // Determine currency from cart items (use first product's currency)
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
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-teal-600" />
          Your Cart
          <span className="text-lg font-normal text-gray-400">({cartItems.length} items)</span>
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Browse the shop to find templates, tools, and services.</p>
            <Link href="/shop" className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors inline-block">
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = products[item.productId];
                if (!product) return null;

                return (
                  <div key={item.productId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-6">
                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      {product.imageUrls?.[0] ? (
                        <img src={product.imageUrls[0]} alt={product.title} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Package className="w-8 h-8 text-gray-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link href={`/shop/${product.id}`} className="font-bold text-gray-900 hover:text-teal-600 transition-colors line-clamp-1">
                        {product.title}
                      </Link>
                      <p className="text-sm text-gray-500 capitalize">{product.listingType}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-teal-700 text-lg">
                        {formatPrice(Number(product.price) * item.quantity, product.currency)}
                      </p>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-red-400 hover:text-red-600 transition-colors mt-2 flex items-center gap-1 text-sm ml-auto"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b">Order Summary</h3>

                <div className="space-y-3 mb-6">
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
                    <span className="font-black text-xl text-teal-700">{formatPrice(calculateTotal(), getCartCurrency())}</span>
                  </div>
                </div>

                {/* Gateway Selection */}
                <div className="mb-5">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGateway('flutterwave')}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        gateway === 'flutterwave'
                          ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500 ring-opacity-20'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <span className="text-xl">🦋</span>
                      <p className={`text-sm font-bold mt-1 ${gateway === 'flutterwave' ? 'text-orange-700' : 'text-gray-700'}`}>Flutterwave</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGateway('paystack')}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        gateway === 'paystack'
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <span className="text-xl">💳</span>
                      <p className={`text-sm font-bold mt-1 ${gateway === 'paystack' ? 'text-blue-700' : 'text-gray-700'}`}>Paystack</p>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut || cartItems.length === 0}
                  className={`w-full text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                    gateway === 'flutterwave'
                      ? 'bg-orange-500 hover:bg-orange-400'
                      : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  {checkingOut ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <><CreditCard className="w-5 h-5" /> Pay with {gateway === 'flutterwave' ? 'Flutterwave' : 'Paystack'}</>
                  )}
                </button>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0" />
                    <span>Escrow-protected. Funds released only after delivery confirmation.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Supports NGN, USD & EUR payments.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
