'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiAuth } from '@/lib/api';
import { Loader2, ShoppingCart, Image as ImageIcon } from 'lucide-react';
import '../shop.css';

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
      fetchCart();
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
        <div className="shop-hero" style={{ paddingBottom: '8px' }}>
          <h1 className="shop-title" style={{ fontSize: '30px' }}>Your cart</h1>
        </div>
        
        {cartItems.length === 0 ? (
          <div className="shop-empty-state">
            <ShoppingCart size={56} style={{ margin: '0 auto 18px', color: 'var(--border)' }} />
            <h3>Your cart is empty</h3>
            <p>Browse the shop and add resources to get started.</p>
            <Link href="/shop" className="shop-btn shop-btn-primary" style={{ marginTop: '10px' }}>
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="shop-cart-layout">
            <div>
              {cartItems.map((item) => {
                const product = item.product || item;
                const quantity = item.quantity || 1;
                return (
                  <div key={item.id} className="shop-cart-item">
                    <div className="shop-cart-thumb">
                      {product.imageUrls?.[0] ? (
                        <img src={product.imageUrls[0]} alt={product.title} />
                      ) : (
                        <ImageIcon />
                      )}
                    </div>
                    <div className="shop-cart-info">
                      <div className="shop-cart-info-title">{product.title}</div>
                      <div className="shop-cart-info-cat">{product.category || 'Category'} · {product.listingType}</div>
                      <button className="shop-cart-remove" onClick={() => handleRemove(product.id)}>Remove</button>
                    </div>
                    <div className="shop-qty-stepper shop-cart-qty">
                      <button disabled>−</button>
                      <span>{quantity}</span>
                      <button disabled>+</button>
                    </div>
                    <div className="shop-cart-price">{formatPrice(product.price * quantity, product.currency)}</div>
                  </div>
                );
              })}
            </div>

            <div className="shop-summary-card">
              <div className="shop-summary-row">
                <span>Subtotal (<span id="cartItemCount">{cartItems.length}</span> items)</span>
                <span className="val">{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="shop-summary-row">
                <span>Discount</span>
                <span className="val">− {formatPrice(0, currency)}</span>
              </div>
              <div className="shop-summary-row">
                <span>Delivery</span>
                <span className="val">{delivery ? formatPrice(delivery, currency) : 'Free'}</span>
              </div>
              <div className="shop-summary-row total">
                <span>Total</span>
                <span className="val">{formatPrice(total, currency)}</span>
              </div>
              <div className="shop-promo">
                <input type="text" placeholder="Promo code" />
                <button className="shop-btn shop-btn-ghost">Apply</button>
              </div>
              <Link href="/shop/checkout" className="shop-btn shop-btn-primary shop-btn-block">
                Proceed to checkout →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
