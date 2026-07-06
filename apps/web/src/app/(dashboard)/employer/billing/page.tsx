'use client';

import React, { useState } from 'react';

export default function EmployerBillingPage() {
  const [loading, setLoading] = useState(false);

  const invoices = [
    { id: 'INV-2024-001', date: 'Jun 15, 2026', amount: '₦85,000' },
    { id: 'INV-2024-002', date: 'May 15, 2026', amount: '₦85,000' },
    { id: 'INV-2024-003', date: 'Apr 15, 2026', amount: '₦85,000' },
  ];

  const handleUpdatePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Payment method update functionality would open here.');
    }, 1000);
  };

  return (
    <>
      <div className="plan-card">
        <div>
          <div className="plan-card__name">
            🚀 Growth Plan 
            <span style={{ background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold-h)', padding: '2px 8px', borderRadius: 'var(--r-pill)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Current
            </span>
          </div>
          <div className="plan-card__price">₦85,000 / month · Renews Jul 15, 2026</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn--ghost btn--sm">Change plan</button>
          <button className="btn--danger-outline" style={{ fontSize: '12.5px', padding: '8px 16px' }}>Cancel plan</button>
        </div>
      </div>

      <div className="dcard">
        <div className="dcard__header">
          <div className="dcard__title">Plan usage this cycle</div>
        </div>
        <div className="plan-usage-row">
          <span className="plan-usage-label">Job posts</span>
          <span className="plan-usage-value">4 / 10</span>
        </div>
        <div className="plan-usage-row">
          <span className="plan-usage-label">Featured listings</span>
          <span className="plan-usage-value">1 / 3</span>
        </div>
        <div className="plan-usage-row">
          <span className="plan-usage-label">Team seats</span>
          <span className="plan-usage-value">3 / 5</span>
        </div>
        <div className="plan-usage-row">
          <span className="plan-usage-label">Applicant exports</span>
          <span className="plan-usage-value">Unlimited</span>
        </div>
      </div>

      <div className="dcard">
        <div className="dcard__header">
          <div className="dcard__title">Payment method</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '30px', background: 'var(--c-700)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'var(--c-300)', flexShrink: 0 }}>
            VISA
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--c-100)' }}>•••• •••• •••• 4242</div>
            <div style={{ fontSize: '11.5px', color: 'var(--c-500)' }}>Expires 08/28</div>
          </div>
          <button 
            className="btn btn--ghost btn--sm" 
            onClick={handleUpdatePayment}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>

      <div className="dcard" style={{ marginBottom: 0 }}>
        <div className="dcard__header">
          <div className="dcard__title">Billing history</div>
        </div>
        {invoices.map((invoice, i) => (
          <div key={invoice.id} className="invoice-row">
            <span className="invoice-row__date">{invoice.date}</span>
            <span className="invoice-row__amount">{invoice.amount}</span>
            <a href="#" className="invoice-row__download">Download</a>
          </div>
        ))}
      </div>
    </>
  );
}
