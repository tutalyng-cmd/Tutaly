'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, apiAuth } from '@/lib/api';
import {
  ArrowLeft, ShoppingCart, Package, Cpu, Wrench, Download,
  Shield, Star, Loader2, CheckCircle2, AlertCircle,
} from 'lucide-react';

const LISTING_TYPE_MAP: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  digital: { label: 'Digital Product', icon: Cpu, color: 'text-purple-700', bg: 'bg-purple-100' },
  physical: { label: 'Physical Product', icon: Package, color: 'text-blue-700', bg: 'bg-blue-100' },
  service: { label: 'Professional Service', icon: Wrench, color: 'text-amber-700', bg: 'bg-amber-100' },
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (params.id) fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/shop/products/${params.id}`);
      setProduct(res.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch product', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/sign-in');
      return;
    }

    setAddingToCart(true);
    try {
      await apiAuth.withToken(token).post('/shop/cart/add', {
        productId: product.id,
        quantity,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price: number, currency?: string) => {
    const cur = currency || 'NGN';
    const locales: Record<string, string> = { NGN: 'en-NG', USD: 'en-US', EUR: 'de-DE' };
    return new Intl.NumberFormat(locales[cur] || 'en-NG', { style: 'currency', currency: cur }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <Link href="/shop" className="text-teal-600 font-medium hover:text-teal-700">
            ← Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const typeInfo = LISTING_TYPE_MAP[product.listingType] || LISTING_TYPE_MAP.digital;
  const TypeIcon = typeInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left: Images */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                {product.imageUrls && product.imageUrls[0] ? (
                  <img src={product.imageUrls[0]} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <TypeIcon className="w-20 h-20 text-gray-300" />
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mt-6 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{product.description}</p>
            </div>
          </div>

          {/* Right: Details & Buy */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className={`inline-flex items-center gap-1.5 ${typeInfo.bg} ${typeInfo.color} px-3 py-1 rounded-lg text-sm font-bold mb-4`}>
                <TypeIcon className="w-4 h-4" /> {typeInfo.label}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>

              {product.subcategory && (
                <p className="text-sm text-gray-500 mb-6">
                  {product.subcategory.category?.name} → {product.subcategory.name}
                </p>
              )}

              {product.pricingType === 'per_unit' ? (
                <div className="mb-6">
                  <p className="text-3xl font-black text-teal-700">{formatPrice(product.price, product.currency)}</p>
                  {product.priceUnit && (
                    <p className="text-sm text-gray-500">per {product.priceUnit}</p>
                  )}
                  {product.priceMayVary && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Final price may vary
                    </p>
                  )}
                </div>
              ) : (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="font-bold text-amber-800">Custom Pricing</p>
                  <p className="text-sm text-amber-700">Contact the seller for a quote tailored to your needs.</p>
                </div>
              )}

              {/* Quantity */}
              {product.pricingType === 'per_unit' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(product.minQuantity || 1, quantity - 1))}
                      className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-50"
                    >
                      −
                    </button>
                    <span className="text-lg font-bold text-gray-900 w-10 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                  {product.minQuantity > 1 && (
                    <p className="text-xs text-gray-500 mt-1">Minimum order: {product.minQuantity}</p>
                  )}
                </div>
              )}

              {/* Add to Cart */}
              {product.pricingType === 'per_unit' ? (
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {addingToCart ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : added ? (
                    <><CheckCircle2 className="w-5 h-5" /> Added to Cart!</>
                  ) : (
                    <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                  )}
                </button>
              ) : (
                <button className="w-full bg-amber-500 hover:bg-amber-400 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg transition-all">
                  Request a Quote
                </button>
              )}

              {product.pricingType === 'per_unit' && (
                <Link
                  href="/shop/cart"
                  className="block text-center text-sm font-medium text-teal-600 hover:text-teal-700 mt-3"
                >
                  View Cart →
                </Link>
              )}
            </div>

            {/* Trust badges */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-50 p-2 rounded-lg">
                    <Shield className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Escrow Protection</p>
                    <p className="text-xs text-gray-500">Payment held securely until you confirm delivery</p>
                  </div>
                </div>
                {product.listingType === 'digital' && (
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-50 p-2 rounded-lg">
                      <Download className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Instant Download</p>
                      <p className="text-xs text-gray-500">Access your file immediately after payment</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="bg-green-50 p-2 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Verified Seller</p>
                    <p className="text-xs text-gray-500">All sellers are vetted and approved by Tutaly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
