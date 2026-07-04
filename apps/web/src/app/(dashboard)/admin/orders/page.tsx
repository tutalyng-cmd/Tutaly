'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Package, 
  ShieldCheck,
  XCircle,
  Flag,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { apiAuth } from '@/lib/api';

const ORDER_STATUSES = [
  { label: 'All Orders', value: '' },
  { label: 'Pending Payment', value: 'pending_payment' },
  { label: 'Paid', value: 'paid' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Completed', value: 'completed' },
  { label: 'Flagged', value: 'flagged' },
  { label: 'Refunded', value: 'refunded' },
];

interface OrderItem {
  id: string;
  status: string;
  amountPaid: number;
  currency: string;
  paymentGateway: string;
  paymentRef: string;
  createdAt: string;
  adminNotes: string | null;
  product?: { title: string; listingType: string };
  buyer?: { email: string };
  seller?: { email: string };
}

function AdminOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || '';
  
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Reset page when status filter changes
  useEffect(() => {
    setPage(1);
  }, [currentStatus]);

  const fetchOrders = React.useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await apiAuth.withToken(token || undefined).get('/admin/orders', {
        params: { status: currentStatus || undefined, page, limit: 20 }
      });
      setOrders(res.data.items || []);
      setMeta(res.data.meta);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const error = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const err = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.push('/auth/signin');
        return;
      }
      setError(error.response?.data?.message || error.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  }, [currentStatus, page, router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ─── Admin Actions ───────────────────────────────────────────────

  const handleVerifyPayment = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const token = localStorage.getItem('access_token');
      const res = await apiAuth.withToken(token || undefined).post(`/admin/orders/${orderId}/verify-payment`);
      const data = res.data;
      if (data.verified) {
        alert(`✅ Payment verified!\n\nStatus updated to: ${data.newStatus}\nAmount: ${data.gatewayData?.currency} ${data.gatewayData?.amount}\nPaid at: ${data.gatewayData?.paidAt}\nChannel: ${data.gatewayData?.channel}`);
      } else {
        alert(`⚠️ Payment NOT confirmed.\n\nPaystack status: "${data.gatewayStatus}"\n\n${data.message}`);
      }
      fetchOrders();
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const error = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const err = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
      alert(error.response?.data?.message || error.message || 'Verification failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const note = prompt('Enter reason for cancelling this order:');
    if (note === null) return;

    setActionLoading(orderId);
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).patch(`/admin/orders/${orderId}/cancel`, { adminNotes: note });
      fetchOrders();
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const error = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const err = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
      alert(error.response?.data?.message || error.message || 'Cancel failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFlagOrder = async (orderId: string) => {
    const note = prompt('Enter reason for flagging this order:');
    if (note === null) return;

    setActionLoading(orderId);
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).patch(`/admin/orders/${orderId}/flag`, { adminNotes: note });
      fetchOrders();
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const error = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const err = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
      alert(error.response?.data?.message || error.message || 'Flag failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (id: string, resolution: 'completed' | 'refunded') => {
    const note = prompt(`Enter optional admin notes for resolving as ${resolution}:`);
    if (note === null) return;

    setActionLoading(id);
    try {
      const token = localStorage.getItem('access_token');
      await apiAuth.withToken(token || undefined).patch(`/admin/orders/${id}/resolve`, { resolution, adminNotes: note });
      fetchOrders();
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const error = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const err = e as { response?: { data?: { message?: string } } };
      /* eslint-enable @typescript-eslint/no-unused-vars */
      alert(error.response?.data?.message || error.message || 'Resolve failed');
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Status Badge ────────────────────────────────────────────────

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <span className="px-2 py-1 bg-green text-green rounded-full text-xs font-bold uppercase">Completed</span>;
      case 'paid': return <span className="px-2 py-1 bg-blueL text-blueH rounded-full text-xs font-bold uppercase">Paid</span>;
      case 'delivered': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase">Delivered</span>;
      case 'flagged': return <span className="px-2 py-1 bg-red text-red rounded-full text-xs font-bold uppercase">Flagged</span>;
      case 'refunded': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase">Refunded</span>;
      case 'pending_payment': return <span className="px-2 py-1 bg-gold text-goldH rounded-full text-xs font-bold uppercase">Pending Payment</span>;
      default: return <span className="px-2 py-1 bg-c100 text-c700 rounded-full text-xs font-bold uppercase">{status}</span>;
    }
  };

  // ─── Action Buttons per Status ───────────────────────────────────

  const renderActions = (order: OrderItem) => {
    const isLoading = actionLoading === order.id;
    const loadingSpinner = <RefreshCw className="w-3.5 h-3.5 animate-spin" />;

    switch (order.status) {
      case 'pending_payment':
        return (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => handleVerifyPayment(order.id)}
              disabled={isLoading}
              className="bg-blueL text-blueH hover:bg-blueL px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
              title="Check payment status with Paystack"
            >
              {isLoading ? loadingSpinner : <ShieldCheck className="w-3.5 h-3.5" />} Verify
            </button>
            <button
              onClick={() => handleCancelOrder(order.id)}
              disabled={isLoading}
              className="bg-red text-red hover:bg-red px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
              title="Cancel this order"
            >
              {isLoading ? loadingSpinner : <XCircle className="w-3.5 h-3.5" />} Cancel
            </button>
          </div>
        );

      case 'paid':
        return (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => handleFlagOrder(order.id)}
              disabled={isLoading}
              className="bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
              title="Flag this order for review"
            >
              {isLoading ? loadingSpinner : <Flag className="w-3.5 h-3.5" />} Flag
            </button>
          </div>
        );

      case 'delivered':
        return (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => handleResolve(order.id, 'completed')}
              disabled={isLoading}
              className="bg-green text-green hover:bg-green px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
              title="Release funds to seller now"
            >
              {isLoading ? loadingSpinner : <CheckCircle className="w-3.5 h-3.5" />} Release
            </button>
            <button
              onClick={() => handleFlagOrder(order.id)}
              disabled={isLoading}
              className="bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
              title="Flag this order for review"
            >
              {isLoading ? loadingSpinner : <Flag className="w-3.5 h-3.5" />} Flag
            </button>
          </div>
        );

      case 'flagged':
        return (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => handleResolve(order.id, 'completed')}
              disabled={isLoading}
              className="bg-green text-green hover:bg-green px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              {isLoading ? loadingSpinner : <CheckCircle className="w-3.5 h-3.5" />} Release
            </button>
            <button
              onClick={() => handleResolve(order.id, 'refunded')}
              disabled={isLoading}
              className="bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              {isLoading ? loadingSpinner : <RefreshCw className="w-3.5 h-3.5" />} Refund
            </button>
          </div>
        );

      case 'completed':
      case 'refunded':
        return (
          <div className="flex justify-end">
            <span className="text-c400 text-xs font-medium flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> View only
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-c900">Marketplace Orders</h1>
          <p className="text-c500 mt-1">Track and manage all shop transactions and escrow states.</p>
        </div>
        {meta && (
          <div className="text-sm text-c500 font-medium">
            {meta.total} order{meta.total !== 1 ? 's' : ''} total
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {ORDER_STATUSES.map((tab) => (
          <button
            key={tab.value}
            onClick={() => router.push(`/admin/orders?status=${tab.value}`)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              currentStatus === tab.value
                ? 'bg-green text-white shadow-lg shadow-teal-600/20'
                : 'bg-white text-c600 border border-c100 hover:border-green'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Action Legend */}
      <div className="bg-c100 border border-c100 rounded-2xl p-4">
        <p className="text-xs font-bold text-c500 uppercase tracking-wider mb-2">Admin Actions Guide</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-c600">
          <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue" /> <span><strong>Verify</strong> — Check Paystack for stuck payments</span></div>
          <div className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red" /> <span><strong>Cancel</strong> — Cancel unpaid or suspicious orders</span></div>
          <div className="flex items-center gap-2"><Flag className="w-4 h-4 text-orange-600" /> <span><strong>Flag</strong> — Mark for admin review</span></div>
          <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green" /> <span><strong>Release</strong> — Release funds to seller</span></div>
        </div>
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
        ) : orders.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="w-16 h-16 text-c200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-c900 mb-1">No orders found</h3>
            <p className="text-c500">There are no orders matching the selected status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-c100">
              <thead className="bg-c100/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">Product & ID</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">Buyer / Seller</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-c500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-c500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-c100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-c100/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-c900 line-clamp-1">{order.product?.title || 'Unknown Product'}</div>
                      <div className="text-xs text-c400 font-mono mt-0.5">{order.id.slice(0, 8)}…</div>
                      {order.adminNotes && (
                        <div className="text-xs text-gold mt-1 italic line-clamp-1" title={order.adminNotes}>
                          📝 {order.adminNotes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-bold text-green w-4">B:</span>
                          <span className="text-c600">{order.buyer?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-bold text-orange-600 w-4">S:</span>
                          <span className="text-c600">{order.seller?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-black text-c900">{order.currency} {Number(order.amountPaid).toLocaleString()}</div>
                      <div className="text-xs text-c400 uppercase font-bold">{order.paymentGateway}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {renderActions(order)}
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

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green"></div>
      </div>
    }>
      <AdminOrdersContent />
    </Suspense>
  );
}
