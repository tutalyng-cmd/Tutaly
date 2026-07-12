'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { Country, State } from 'country-state-city';
import { INDUSTRIES } from '@/lib/constants';

export default function SubmitSalaryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    industry: 'Fintech',
    location: 'Lagos, Nigeria',
    yearsOfExperience: '0–2 years',
    companySize: 'Startup (1–50)',
    currency: 'NGN',
    salaryPeriod: 'monthly',
    salaryAmount: '',
    bonusAmount: '',
    equityValue: '',
    submissionYear: new Date().getFullYear(),
    confirmed: true,
  });

  const [country, setCountry] = useState('Nigeria');
  const [state, setState] = useState('');

  const countries = useMemo(() => Country.getAllCountries().map(c => c.name), []);
  const states = useMemo(() => {
    if (!country) return [];
    const c = Country.getAllCountries().find(c => c.name === country);
    return c ? State.getStatesOfCountry(c.isoCode).map(s => s.name) : [];
  }, [country]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCountry(val);
    setState('');
    setFormData(prev => ({ ...prev, location: val }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setState(val);
    setFormData(prev => ({ ...prev, location: val ? `${val}, ${country}` : country }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxToggle = () => {
    setFormData(prev => ({ ...prev, confirmed: !prev.confirmed }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.confirmed) {
      alert("Please confirm the information is accurate.");
      return;
    }
    setLoading(true);

    try {
      const payload = {
        role: formData.role,
        company: formData.company,
        industry: formData.industry,
        location: formData.location,
        currency: formData.currency,
        salaryPeriod: formData.salaryPeriod,
        salaryAmount: parseFloat(formData.salaryAmount),
        submissionYear: formData.submissionYear,
      };

      await api.post('/salaries', payload);

      setSuccess(true);
      setTimeout(() => {
        router.push('/salaries');
      }, 3000);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
      alert(err.response?.data?.message || 'Failed to submit salary');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--c-800)', border: '1px solid var(--c-700)', borderRadius: 'var(--r-xl)', padding: '32px', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--green-10)', color: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <ShieldCheck style={{ width: '32px', height: '32px' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--c-100)', marginBottom: '8px' }}>Submitted Anonymously!</h2>
          <p style={{ fontSize: '14px', color: 'var(--c-400)', marginBottom: '24px', lineHeight: 1.6 }}>Your salary data helps increase transparency for all Nigerian professionals. Thank you!</p>
          <div style={{ color: 'var(--green)', fontSize: '14px', fontWeight: 600, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>Redirecting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <header className="page-header" style={{ textAlign: 'center', borderBottom: 'none' }}>
        <div className="container container--narrow">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: '16px' }}>
            <div style={{ width: '20px', height: '2px', background: 'var(--gold)' }}></div>
            Salary intelligence
          </div>
          <h1 className="page-header__title" style={{ marginBottom: '16px' }}>Share your salary anonymously</h1>
          <p className="page-header__sub" style={{ fontSize: '16px', maxWidth: '540px', margin: '0 auto', lineHeight: 1.6 }}>
            Help the next person negotiate better. Takes about 2 minutes — no name, no email required.
          </p>
        </div>
      </header>

      <div className="container" style={{ maxWidth: '680px', padding: '32px 24px 80px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ background: 'var(--c-800)', border: '1px solid var(--c-700)', borderRadius: 'var(--r-xl)', padding: '28px' }}>
            
            <div className="form-section">
              <div className="form-section__title">Role &amp; company</div>
              <div className="form-field">
                <label className="form-label" htmlFor="s-title">Job title<span className="required">*</span></label>
                <input className="input" type="text" id="s-title" name="role" value={formData.role} onChange={handleChange} placeholder="e.g. Product Manager" required />
              </div>
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label" htmlFor="s-company">Company</label>
                  <input className="input" type="text" id="s-company" name="company" value={formData.company} onChange={handleChange} placeholder="e.g. Flutterwave" />
                  <p className="field-hint">Optional — helps others compare by employer</p>
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="s-industry">Industry</label>
                  <select className="input" id="s-industry" name="industry" value={formData.industry} onChange={handleChange}>
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section__title">Location &amp; experience</div>
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label" htmlFor="s-country">Country<span className="required">*</span></label>
                  <select className="input" id="s-country" value={country} onChange={handleCountryChange} required>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="s-state">State/Region</label>
                  <select className="input" id="s-state" value={state} onChange={handleStateChange}>
                    <option value="">Select State</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-grid-2" style={{ marginBottom: 0 }}>
                <div className="form-field">
                  <label className="form-label" htmlFor="s-exp">Years of experience<span className="required">*</span></label>
                  <select className="input" id="s-exp" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange}>
                    <option value="0–2 years">0–2 years</option>
                    <option value="3–6 years">3–6 years</option>
                    <option value="7–10 years">7–10 years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="s-size">Company size</label>
                  <select className="input" id="s-size" name="companySize" value={formData.companySize} onChange={handleChange}>
                    <option value="Startup (1–50)">Startup (1–50)</option>
                    <option value="Mid-size (51–500)">Mid-size (51–500)</option>
                    <option value="Enterprise (500+)">Enterprise (500+)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section__title">Compensation</div>
              <div className="form-section__desc">Enter your base salary before tax. All figures stay anonymous.</div>
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label" htmlFor="s-currency">Currency<span className="required">*</span></label>
                  <select className="input" id="s-currency" name="currency" value={formData.currency} onChange={handleChange}>
                    <option value="NGN">₦ Nigerian Naira</option>
                    <option value="USD">$ US Dollar</option>
                    <option value="GBP">£ British Pound</option>
                    <option value="EUR">€ Euro</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="s-period">Pay period</label>
                  <select className="input" id="s-period" name="salaryPeriod" value={formData.salaryPeriod} onChange={handleChange}>
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annually</option>
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="s-base">Base salary<span className="required">*</span></label>
                <input className="input" type="number" id="s-base" name="salaryAmount" value={formData.salaryAmount} onChange={handleChange} placeholder="e.g. 850000" required min="0" />
              </div>
              <div className="form-grid-2" style={{ marginBottom: 0 }}>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="s-bonus">Annual bonus</label>
                  <input className="input" type="number" id="s-bonus" name="bonusAmount" value={formData.bonusAmount} onChange={handleChange} placeholder="Optional" min="0" />
                </div>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="s-equity">Equity value</label>
                  <input className="input" type="number" id="s-equity" name="equityValue" value={formData.equityValue} onChange={handleChange} placeholder="Optional" min="0" />
                </div>
              </div>
            </div>

            <div className="form-section" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
              <div className="check-row" style={{ marginBottom: 0, cursor: 'pointer' }} onClick={handleCheckboxToggle}>
                <span className={`filter-checkbox ${formData.confirmed ? 'checked' : ''}`} style={{ marginTop: '2px' }}></span>
                <span>I confirm this information is accurate. I understand my submission is completely anonymous and cannot be traced back to me.</span>
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => router.back()} className="btn btn--ghost" disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Submitting...
                </>
              ) : 'Submit Salary'}
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '24px', padding: '16px 18px', background: 'var(--blue-10)', border: '1px solid var(--blue-10)', borderRadius: 'var(--r-md)' }}>
          <ShieldCheck style={{ color: 'var(--blue-l)', flexShrink: 0, width: '18px', height: '18px' }} />
          <p style={{ fontSize: '12.5px', color: 'var(--c-400)', margin: 0 }}>Your identity is never stored with your salary data. Tutaly aggregates submissions to build accurate, anonymous market benchmarks.</p>
        </div>

      </div>
    </div>
  );
}
