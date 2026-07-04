'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  Package, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Store,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { apiAuth } from '@/lib/api';

const PRODUCT_STATUSES = [
  { label: 'All Products', value: '' },
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
];

function AdminProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentActive = searchParams.get('isActive') || '';
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const [page, setPage] = useState(1);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [currentActive]);

  const fetchProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await apiAuth.withToken(token || undefined).get('/admin/products', {
        params: { isActive: currentActive || undefined, page, limit: 20 }
      });
      setProducts(res.data.items || []);
      setMeta(res.data.meta || null);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const error = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const err = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/auth/signin');
        return;
      }
      setError(err.response?.data?.message || err.message || 'Error loading products');
    } finally {
      setLoading(false);
    }
  }, [currentActive, page, router]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).patch(`/shop/products/${id}`, { isActive: !currentStatus });
      fetchProducts();
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const error = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const err = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
alert(err.response?.data?.message || 'Failed to update product status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-c900">Shop Catalog</h1>
          <p className="text-c500 mt-1">Manage all templates, physical products, and professional services.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {PRODUCT_STATUSES.map((tab) => (
          <button
            key={tab.value}
            onClick={() => router.push(`/admin/products?isActive=${tab.value}`)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              currentActive === tab.value
                ? 'bg-green text-white shadow-lg shadow-teal-600/20'
                : 'bg-white text-c600 border border-c100 hover:border-green'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red border border-red text-red p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white shadow-sm border border-c100 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="w-16 h-16 text-c200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-c900 mb-1">No products found</h3>
            <p className="text-c500">There are no products matching your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-c100">
              <thead className="bg-c100/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">Product Info</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">Seller</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-c500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-c100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-c100/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-c100 rounded-xl overflow-hidden shrink-0 border border-c100 relative">
                          {product.imageUrls?.[0] ? (
                            <Image 
                              src={product.imageUrls[0]} 
                              alt={product.title} 
                              width={48}
                              height={48}
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-c300">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-c900 line-clamp-1">{product.title}</div>
                          <div className="text-xs text-c400 font-bold uppercase tracking-wider">{product.listingType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-green" />
                        <span className="text-sm font-medium text-c700">{product.seller?.employerProfile?.companyName || product.seller?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-bold text-c500 uppercase tracking-tighter">
                        {product.subcategory?.category?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-c400">
                        {product.subcategory?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-black text-green">{product.currency} {Number(product.price).toLocaleString()}</div>
                      <div className="text-xs text-c400 font-bold uppercase">{product.pricingType.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green text-green rounded-full text-xs font-black uppercase">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-c100 text-c500 rounded-full text-xs font-black uppercase">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <a 
                          href={`/shop/${product.id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-c400 hover:text-green transition-colors"
                          title="View on site"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                        <button 
                          onClick={() => toggleProductStatus(product.id, product.isActive)}
                          className={`p-2 transition-colors ${product.isActive ? 'text-red hover:text-red' : 'text-green hover:text-green'}`}
                          title={product.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {product.isActive ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-c500">
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-c600 bg-white border border-c200 rounded-xl hover:bg-c100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= meta.totalPages}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-green rounded-xl hover:bg-green disabled:opacity-40 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green"></div>
      </div>
    }>
      <AdminProductsContent />
    </Suspense>
  );
}
