'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Search, ShoppingBag, Filter, Package, Cpu, Wrench,
  Star, ArrowRight, Loader2, ChevronDown,
} from 'lucide-react';

const LISTING_TYPE_MAP: Record<string, { label: string; icon: any; color: string }> = {
  digital: { label: 'Digital', icon: Cpu, color: 'bg-purple-100 text-purple-700' },
  physical: { label: 'Physical', icon: Package, color: 'bg-blue-100 text-blue-700' },
  service: { label: 'Service', icon: Wrench, color: 'bg-amber-100 text-amber-700' },
};

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [listingType, setListingType] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [page, search, listingType]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '12');
      if (search) params.append('search', search);
      if (listingType) params.append('listingType', listingType);

      const res = await api.get(`/shop/products?${params.toString()}`);
      setProducts(res.data?.data || []);
      setTotal(res.data?.meta?.total || 0);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const formatPrice = (price: number, currency?: string) => {
    const cur = currency || 'NGN';
    const locales: Record<string, string> = { NGN: 'en-NG', USD: 'en-US', EUR: 'de-DE' };
    return new Intl.NumberFormat(locales[cur] || 'en-NG', { style: 'currency', currency: cur }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-blue-950 to-indigo-950 py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-teal-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-teal-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
            <ShoppingBag className="w-4 h-4" /> Work-Focused Marketplace
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Tutaly Shop
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Templates, tools, digital products, and professional services built by Nigerian professionals, for Nigerian professionals.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search templates, tools, services..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border-0 focus:ring-2 focus:ring-teal-500 shadow-lg text-gray-900 text-lg"
              />
            </div>
            <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition-colors shrink-0">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => { setListingType(''); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!listingType ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              All Types
            </button>
            {Object.entries(LISTING_TYPE_MAP).map(([key, { label, icon: Icon, color }]) => (
              <button
                key={key}
                onClick={() => { setListingType(key); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${listingType === key ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">{total} products found</p>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: any) => {
                const typeInfo = LISTING_TYPE_MAP[product.listingType] || LISTING_TYPE_MAP.digital;
                const TypeIcon = typeInfo.icon;
                return (
                  <Link key={product.id} href={`/shop/${product.id}`} className="group block">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-teal-200 transition-all duration-300 transform group-hover:-translate-y-1">
                      {/* Image placeholder */}
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center relative overflow-hidden">
                        {product.imageUrls && product.imageUrls[0] ? (
                          <img src={product.imageUrls[0]} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <TypeIcon className="w-12 h-12 text-gray-300 group-hover:scale-110 transition-transform" />
                        )}
                        <span className={`absolute top-3 left-3 ${typeInfo.color} px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1`}>
                          <TypeIcon className="w-3 h-3" /> {typeInfo.label}
                        </span>
                      </div>

                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-teal-600 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{product.description}</p>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          {product.pricingType === 'per_unit' ? (
                            <span className="text-lg font-black text-teal-700">
                              {formatPrice(product.price, product.currency)}
                            </span>
                          ) : (
                            <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                              Request Quote
                            </span>
                          )}
                          <span className="text-teal-600 text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            View <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {total > 12 && (
              <div className="flex justify-center gap-2 mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-500">
                  Page {page} of {Math.ceil(total / 12)}
                </span>
                <button
                  disabled={page >= Math.ceil(total / 12)}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
