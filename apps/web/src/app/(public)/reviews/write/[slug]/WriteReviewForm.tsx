'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ShieldCheck, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';

const StarRating = ({ value, onChange, label }: { value: number, onChange: (val: number) => void, label?: boolean }) => {
  const [hoverValue, setHoverValue] = useState(0);
  const getLabel = (val: number) => {
    switch (val) {
      case 5: return "5 - Excellent";
      case 4: return "4 - Very good";
      case 3: return "3 - Average";
      case 2: return "2 - Poor";
      case 1: return "1 - Terrible";
      default: return "Select";
    }
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div className="star-input">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star-input__star ${star <= (hoverValue || value) ? 'filled' : ''}`}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            onClick={() => onChange(star)}
          >
            ★
          </span>
        ))}
      </div>
      {label && <div className="star-input__label" style={{ minWidth: '120px' }}>{getLabel(hoverValue || value)}</div>}
    </div>
  );
};

export default function WriteReviewForm({ company }: { company: any }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobLocation: '',
    isCurrentEmployee: true,
    employmentEndYear: new Date().getFullYear(),
    ratingOverall: 0,
    ratingWorkLife: 0,
    ratingPay: 0,
    ratingManagement: 0,
    ratingCulture: 0,
    reviewTitle: '',
    pros: '',
    cons: '',
    recommend: true,
    displayName: '',
    confirmed: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.jobTitle.trim()) {
        alert('Please enter your job title.');
        return;
      }
    } else if (step === 2) {
      if (formData.ratingOverall === 0) {
        alert('Please provide an overall rating.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.confirmed) {
      alert("Please confirm the information is accurate.");
      return;
    }
    if (formData.pros.length < 10 || formData.cons.length < 10) {
      alert('Pros and Cons must be at least 10 characters long');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const payload = {
        company_id: company.id,
        jobTitle: formData.jobTitle,
        jobLocation: formData.jobLocation,
        isCurrentEmployee: formData.isCurrentEmployee,
        employmentEndYear: !formData.isCurrentEmployee ? Number(formData.employmentEndYear) : undefined,
        ratingOverall: formData.ratingOverall,
        ratingWorkLife: formData.ratingWorkLife || undefined,
        ratingPay: formData.ratingPay || undefined,
        ratingManagement: formData.ratingManagement || undefined,
        ratingCulture: formData.ratingCulture || undefined,
        reviewTitle: formData.reviewTitle,
        pros: formData.pros,
        cons: formData.cons,
        recommend: formData.recommend,
        displayName: formData.displayName || 'Anonymous Review',
      };

      await api.post('/reviews/companies', payload, config);

      setSuccess(true);
      setTimeout(() => {
        router.push(`/reviews/company/${company.slug}`);
      }, 3000);
    } catch (e) {
      const err = e as any;
      alert(err.response?.data?.message || 'Failed to submit review');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ background: 'var(--c-800)', border: '1px solid var(--c-700)', borderRadius: 'var(--r-xl)', padding: '32px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ width: '64px', height: '64px', background: 'var(--green-10)', color: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <ShieldCheck style={{ width: '32px', height: '32px' }} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--c-100)', marginBottom: '8px' }}>Review Submitted!</h2>
        <p style={{ fontSize: '14px', color: 'var(--c-400)', marginBottom: '24px', lineHeight: 1.6 }}>Thank you for your anonymous contribution. Your review is pending moderation and will be published shortly.</p>
        <div style={{ color: 'var(--green)', fontSize: '14px', fontWeight: 600, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>Redirecting to {company.name}...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--c-800)', border: '1px solid var(--c-700)', borderRadius: 'var(--r-xl)', padding: '28px' }}>
      
      {/* Step Indicator */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ flex: 1, height: '4px', background: s <= step ? 'var(--gold)' : 'var(--c-700)', borderRadius: '2px' }} />
        ))}
      </div>

      {step === 1 && (
        <div className="form-section fade-in">
          <div className="form-section__title">Step 1: Your Role</div>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label">Job title<span className="required">*</span></label>
              <input className="input" type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="e.g. Product Manager" autoFocus />
            </div>
            <div className="form-field">
              <label className="form-label">Location</label>
              <input className="input" type="text" name="jobLocation" value={formData.jobLocation} onChange={handleChange} placeholder="e.g. Lagos, Nigeria" />
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label className="form-label">Employment status</label>
              <select className="input" name="isCurrentEmployee" value={formData.isCurrentEmployee.toString()} onChange={(e) => setFormData(p => ({ ...p, isCurrentEmployee: e.target.value === 'true' }))}>
                <option value="true">Current employee</option>
                <option value="false">Former employee</option>
              </select>
            </div>
            {!formData.isCurrentEmployee && (
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label className="form-label">End Year</label>
                <input className="input" type="number" name="employmentEndYear" value={formData.employmentEndYear} onChange={handleChange} min={2000} max={new Date().getFullYear()} />
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="form-section fade-in">
          <div className="form-section__title">Step 2: Rate your experience</div>
          <div className="form-field" style={{ padding: '16px', background: 'var(--c-900)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-700)' }}>
            <label className="form-label" style={{ fontSize: '16px', marginBottom: '8px' }}>Overall rating<span className="required">*</span></label>
            <StarRating value={formData.ratingOverall} onChange={(val) => setFormData(p => ({ ...p, ratingOverall: val }))} label={true} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
            <div>
              <label className="form-label">Work-Life Balance</label>
              <StarRating value={formData.ratingWorkLife} onChange={(val) => setFormData(p => ({ ...p, ratingWorkLife: val }))} />
            </div>
            <div>
              <label className="form-label">Compensation & Benefits</label>
              <StarRating value={formData.ratingPay} onChange={(val) => setFormData(p => ({ ...p, ratingPay: val }))} />
            </div>
            <div>
              <label className="form-label">Senior Management</label>
              <StarRating value={formData.ratingManagement} onChange={(val) => setFormData(p => ({ ...p, ratingManagement: val }))} />
            </div>
            <div>
              <label className="form-label">Culture & Values</label>
              <StarRating value={formData.ratingCulture} onChange={(val) => setFormData(p => ({ ...p, ratingCulture: val }))} />
            </div>
          </div>

          <div className="toggle-row" style={{ marginTop: '32px', borderBottom: 'none', padding: 0, cursor: 'pointer' }} onClick={() => setFormData(p => ({ ...p, recommend: !p.recommend }))}>
            <div>
              <div className="toggle-row__title">Would you recommend this company?</div>
              <div className="toggle-row__desc">Shown as a badge on your review</div>
            </div>
            <div className={`toggle-switch ${formData.recommend ? 'on' : ''}`}></div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="form-section fade-in">
          <div className="form-section__title">Step 3: The Details</div>
          
          <div className="form-field">
            <label className="form-label">Review title<span className="required">*</span></label>
            <input className="input" type="text" name="reviewTitle" value={formData.reviewTitle} onChange={handleChange} placeholder="Sum up your experience in one line" />
          </div>

          <div className="form-field">
            <label className="form-label">Pros<span className="required">*</span></label>
            <textarea className="input w-full" name="pros" value={formData.pros} onChange={handleChange} placeholder="What did you like about working here?" maxLength={2000} style={{ minHeight: '100px', resize: 'vertical' }}></textarea>
            <div style={{ fontSize: '11px', color: 'var(--c-500)', marginTop: '4px', textAlign: 'right' }}>{formData.pros.length} / 2000</div>
          </div>

          <div className="form-field">
            <label className="form-label">Cons<span className="required">*</span></label>
            <textarea className="input w-full" name="cons" value={formData.cons} onChange={handleChange} placeholder="What could be improved?" maxLength={2000} style={{ minHeight: '100px', resize: 'vertical' }}></textarea>
            <div style={{ fontSize: '11px', color: 'var(--c-500)', marginTop: '4px', textAlign: 'right' }}>{formData.cons.length} / 2000</div>
          </div>

          <div className="form-field">
            <label className="form-label">Display Name</label>
            <input className="input" type="text" name="displayName" value={formData.displayName} onChange={handleChange} placeholder="e.g. Anonymous Review, Ex-Developer" />
          </div>

          <div className="check-row" style={{ marginTop: '16px', marginBottom: 0, cursor: 'pointer', padding: '16px', background: 'var(--c-900)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-700)' }} onClick={() => setFormData(p => ({ ...p, confirmed: !p.confirmed }))}>
            <span className={`filter-checkbox ${formData.confirmed ? 'checked' : ''}`} style={{ marginTop: '2px' }}></span>
            <span style={{ fontSize: '13px', color: 'var(--c-300)' }}>I confirm this review is truthful, describes my personal experience, and I understand it is public and will be posted anonymously.</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--c-700)' }}>
        {step > 1 ? (
          <button type="button" onClick={handleBack} className="btn btn--ghost" disabled={loading}>
            <ChevronLeft className="w-4 h-4 mr-2 inline" /> Back
          </button>
        ) : <div />}
        
        {step < 3 ? (
          <button type="button" onClick={handleNext} className="btn btn--primary">
            Next <ChevronRight className="w-4 h-4 ml-2 inline" />
          </button>
        ) : (
          <button type="submit" className="btn btn--primary" disabled={loading || !formData.confirmed}>
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin inline" /> Posting...</>
            ) : 'Submit Review'}
          </button>
        )}
      </div>
    </form>
  );
}
