'use client';

import React, { useState } from 'react';
import { CreditCard, Download, Star, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function EmployerBillingPage() {
  const [loading, setLoading] = useState(false);

  const invoices = [
    { id: 'INV-2024-001', date: 'Oct 12, 2024', amount: '₦45,000', plan: 'Growth Plan (Monthly)', status: 'paid' },
    { id: 'INV-2024-002', date: 'Sep 12, 2024', amount: '₦45,000', plan: 'Growth Plan (Monthly)', status: 'paid' },
    { id: 'INV-2024-003', date: 'Aug 12, 2024', amount: '₦45,000', plan: 'Growth Plan (Monthly)', status: 'paid' },
  ];

  const handleUpdatePayment = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Payment method update functionality would open here.');
    }, 1000);
  };

  return (
    <div className="max-w-4xl">
      <div className="dcard mb-6">
        <div className="dcard__header">
          <div>
            <h1 className="dcard__title flex items-center gap-2">
              <CreditCard className="w-5 h-5" style={{ color: 'var(--blue-l)' }} /> Billing & Plan
            </h1>
            <p className="dcard__sub">Manage your subscription, payment methods, and billing history.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Current Plan */}
        <div className="dcard" style={{ background: 'linear-gradient(135deg, var(--green-10), transparent)', borderColor: 'var(--green-20)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5" style={{ color: 'var(--green)' }} />
            <h2 className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--green-light)' }}>Current Plan</h2>
          </div>
          <div className="mb-6">
            <div className="text-3xl font-black mb-1" style={{ color: 'var(--c-100)' }}>Growth Plan</div>
            <div className="text-sm font-medium" style={{ color: 'var(--c-400)' }}>₦45,000 / month</div>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--c-300)' }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--green)' }} /> Up to 10 active job posts
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--c-300)' }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--green)' }} /> Applicant tracking system
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--c-300)' }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--green)' }} /> Standard support
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn btn--primary flex-1">Upgrade Plan</button>
            <button className="btn btn--outline" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>Cancel</button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="dcard flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5" style={{ color: 'var(--gold)' }} />
            <h2 className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--c-400)' }}>Payment Method</h2>
          </div>
          
          <div className="p-4 rounded-xl border border-c700 mb-6 flex-1 flex flex-col justify-center" style={{ backgroundColor: 'var(--c-800)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold" style={{ color: 'var(--c-100)' }}>Visa ending in 4242</div>
              <div className="px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: 'var(--blue-10)', color: 'var(--blue-l)' }}>Default</div>
            </div>
            <div className="text-sm" style={{ color: 'var(--c-400)' }}>Expires 12/2026</div>
          </div>

          <button 
            onClick={handleUpdatePayment}
            disabled={loading}
            className="btn btn--outline w-full"
          >
            {loading ? 'Processing...' : 'Update Payment Method'}
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="dcard p-0 overflow-hidden">
        <div className="p-6 border-b border-c700 flex items-center justify-between">
          <div>
            <h2 className="font-bold" style={{ color: 'var(--c-100)' }}>Billing History</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--c-400)' }}>View and download past invoices.</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead style={{ backgroundColor: 'var(--c-800)', borderBottom: '1px solid var(--c-700)' }} className="text-xs font-semibold uppercase tracking-wider text-c400">
              <tr>
                <th className="p-4" style={{ color: 'var(--c-400)' }}>Invoice</th>
                <th className="p-4" style={{ color: 'var(--c-400)' }}>Date</th>
                <th className="p-4" style={{ color: 'var(--c-400)' }}>Amount</th>
                <th className="p-4" style={{ color: 'var(--c-400)' }}>Plan</th>
                <th className="p-4" style={{ color: 'var(--c-400)' }}>Status</th>
                <th className="p-4 text-right" style={{ color: 'var(--c-400)' }}>Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-c700">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-c800 transition-colors">
                  <td className="p-4 font-bold" style={{ color: 'var(--c-100)' }}>{invoice.id}</td>
                  <td className="p-4 text-sm" style={{ color: 'var(--c-400)' }}>{invoice.date}</td>
                  <td className="p-4 text-sm font-medium" style={{ color: 'var(--c-100)' }}>{invoice.amount}</td>
                  <td className="p-4 text-sm" style={{ color: 'var(--c-300)' }}>{invoice.plan}</td>
                  <td className="p-4">
                    <span className="tag tag--green capitalize">{invoice.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-c700 transition-colors inline-flex" style={{ color: 'var(--c-400)' }}>
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
