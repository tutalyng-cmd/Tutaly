'use client';

import { toast } from 'react-hot-toast';

import React, { useState, useEffect } from 'react';
import { apiAuth } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface Subscription {
  id: string;
  planName: string;
  status: string;
  price: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  paymentGateway: string;
  paymentRef?: string;
}

interface Invoice {
  id: string;
  invoiceId: string;
  date: string;
  amount: number;
  status: string;
  downloadUrl?: string;
}

export default function EmployerBillingPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).get('/billing/subscription');
      if (res.data) {
        setSubscription(res.data.subscription);
        setInvoices(res.data.invoices || []);
      }
    } catch (err) {
      console.error('Failed to fetch billing data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      // Re-initialize payment for the same plan via Paystack
      const res = await apiAuth.withToken(token).post('/billing/subscription/initialize', {
        planName: subscription?.planName || 'Growth Plan',
        gatewayName: 'paystack',
        price: subscription?.price || 85000,
      });

      if (res.data?.paymentLink) {
        window.location.href = res.data.paymentLink;
      } else if (res.data?.redirectUrl) {
        window.location.href = res.data.redirectUrl;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelPlan = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await apiAuth.withToken(token).post('/billing/subscription/cancel');
      toast.success('Subscription canceled successfully');
      fetchBillingData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  const isSubscribed = subscription && subscription.status === 'active';

  return (
    <>
      <div className="page-header">
        <div className="page-header__content">
          <div className="page-header__title">Billing & Subscriptions</div>
          <p className="text-sm text-c400 mt-1">Manage your employer plan and payment methods.</p>
        </div>
      </div>

      <div className="plan-card">
        <div>
          <div className="plan-card__name">
            🚀 {subscription?.planName || 'Growth Plan'} 
            <span className={`status-badge ml-3 bg-transparent border ${
              isSubscribed ? 'status-badge--success border-gold text-gold' : 'border-c500 text-c400'
            }`}>
              {isSubscribed ? 'Active' : (subscription?.status || 'No Plan')}
            </span>
          </div>
          <div className="plan-card__price">
            ₦{Number(subscription?.price || 85000).toLocaleString()} / month 
            {isSubscribed && subscription.currentPeriodEnd && ` · Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
          </div>
        </div>
        <div className="flex gap-2">
          {!isSubscribed ? (
             <button onClick={handleUpdatePayment} disabled={actionLoading} className="btn btn--primary btn--sm">
               {actionLoading ? 'Processing...' : 'Subscribe Now'}
             </button>
          ) : (
            <>
              <button className="btn btn--ghost btn--sm">Change plan</button>
              <button onClick={handleCancelPlan} disabled={actionLoading} className="btn btn--danger btn--outline px-4 py-2 text-xs">Cancel plan</button>
            </>
          )}
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

      {isSubscribed && (
        <div className="dcard">
          <div className="dcard__header">
            <div className="dcard__title">Payment method</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-11 h-8 bg-c700 rounded-sm flex items-center justify-center text-xs font-bold text-c300 shrink-0">
              CARD
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-c100">Via {subscription?.paymentGateway?.toUpperCase()}</div>
              <div className="text-xs text-c500">Ref: {subscription?.paymentRef}</div>
            </div>
            <button 
              className="btn btn--ghost btn--sm" 
              onClick={handleUpdatePayment}
              disabled={actionLoading}
            >
              {actionLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      )}

      <div className="dcard mb-0">
        <div className="dcard__header">
          <div className="dcard__title">Billing history</div>
        </div>
        {invoices.length === 0 ? (
          <div className="p-6 text-center text-c400">No invoices found.</div>
        ) : (
          invoices.map((invoice) => (
            <div key={invoice.id} className="invoice-row">
              <span className="invoice-row__date">{new Date(invoice.date).toLocaleDateString()}</span>
              <span className="invoice-row__amount">₦{Number(invoice.amount).toLocaleString()}</span>
              {invoice.downloadUrl ? (
                <a href={invoice.downloadUrl} target="_blank" rel="noreferrer" className="invoice-row__download">Download</a>
              ) : (
                <span className="text-xs text-c500 capitalize">{invoice.status}</span>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
