'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Package, ShieldCheck, Download } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();

  let orders: any[] = [];
  try {
    const ordersParam = searchParams.get('orders');
    if (ordersParam) {
      orders = JSON.parse(decodeURIComponent(ordersParam));
    }
  } catch {
    // ignore parse errors
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white rounded-3xl shadow-xl p-10 border border-teal-100">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">Order Confirmed!</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Your payment is being processed. Once confirmed, your order will be held securely in escrow.
          </p>

          {/* Order Details */}
          {orders.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-3 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">Order Details</h3>
              {orders.map((order: any, i: number) => (
                <div key={i} className="flex justify-between text-sm py-2 border-b border-gray-200 last:border-0">
                  <span className="text-gray-600 font-mono text-xs">{order.paymentRef}</span>
                  <span className="font-bold text-teal-700">
                    {(() => {
                      const cur = order.currency || 'NGN';
                      const locales: Record<string, string> = { NGN: 'en-NG', USD: 'en-US', EUR: 'de-DE' };
                      return new Intl.NumberFormat(locales[cur] || 'en-NG', { style: 'currency', currency: cur }).format(order.amount);
                    })()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* What Happens Next */}
          <div className="text-left space-y-4 mb-8">
            <h3 className="font-bold text-gray-900 text-center">What Happens Next?</h3>
            <div className="flex items-start gap-3">
              <div className="bg-teal-50 p-2 rounded-lg shrink-0">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Escrow Protection Active</p>
                <p className="text-xs text-gray-500">Your payment is held safely until you confirm delivery.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-2 rounded-lg shrink-0">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Seller Notification</p>
                <p className="text-xs text-gray-500">The seller has been notified and will prepare your order.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-50 p-2 rounded-lg shrink-0">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Digital Downloads</p>
                <p className="text-xs text-gray-500">For digital products, download links appear in your orders page immediately.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/seeker/orders"
              className="flex-1 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              View My Orders <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/shop"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold transition-colors text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
