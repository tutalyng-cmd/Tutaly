'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Download, Package, ArrowRight } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <div className="page-shell" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="container flex-1 flex flex-col items-center justify-center py-20" style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        <div className="mb-8 text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'var(--green-10)', color: 'var(--green)' }}>
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--c-100)' }}>Payment Successful!</h1>
          <p className="text-lg" style={{ color: 'var(--c-400)' }}>Thank you for your purchase. Your order has been confirmed.</p>
        </div>

        <div className="w-full rounded-2xl p-8 mb-8 border" style={{ backgroundColor: 'var(--c-800)', borderColor: 'var(--c-700)' }}>
          <h2 className="text-xl font-bold mb-6 border-b pb-4" style={{ color: 'var(--c-100)', borderColor: 'var(--c-700)' }}>Next Steps</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--c-700)', color: 'var(--blue-l)' }}>
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base mb-1" style={{ color: 'var(--c-100)' }}>Download Digital Products</h3>
                <p className="text-sm" style={{ color: 'var(--c-400)' }}>If you purchased digital resources, you can download them immediately from your Orders page.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--c-700)', color: 'var(--gold)' }}>
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base mb-1" style={{ color: 'var(--c-100)' }}>Track Physical & Service Orders</h3>
                <p className="text-sm" style={{ color: 'var(--c-400)' }}>The seller has been notified. You can track the fulfillment status in your dashboard.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <Link href="/seeker/orders" className="btn btn--primary flex-1 justify-center py-3 w-full">
            View My Orders <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link href="/shop" className="btn flex-1 justify-center py-3 w-full" style={{ backgroundColor: 'transparent', border: '1px solid var(--c-600)', color: 'var(--c-200)' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--c-400)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--c-600)'}>
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}
