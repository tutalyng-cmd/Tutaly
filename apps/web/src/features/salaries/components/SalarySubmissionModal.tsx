'use client';

import { toast } from 'react-hot-toast';

import React, { useState } from 'react';
import { api } from '@/lib/api';

interface SalarySubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle?: string;
  defaultLocation?: string;
}

export const SalarySubmissionModal: React.FC<SalarySubmissionModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultTitle = '', 
  defaultLocation = '' 
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      job_title: formData.get('job_title') as string,
      location: formData.get('location') as string,
      base_pay: Number(formData.get('base_pay')),
      pay_period: formData.get('pay_period') as string,
      bonus_pay: Number(formData.get('bonus_pay') || 0),
      years_experience: Number(formData.get('years_experience') || 0)
    };

    try {
      const res = await api.post('/salaries/engine/submit', data);
      if (res.data?.success || res.status === 201 || res.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit salary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', background: 'var(--black-alpha-70)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--c-900)',
        border: '1px solid var(--c-700)',
        width: '100%', maxWidth: '520px',
        borderRadius: 'var(--r-xl)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--c-800)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--c-800)',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--c-100)' }}>Add Your Salary</h2>
          <button onClick={onClose} style={{ color: 'var(--c-400)', fontSize: '18px', background: 'none' }}>✕</button>
        </div>

        {success ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{
              width: '56px', height: '56px',
              background: 'var(--green-alpha-20)', color: 'var(--green)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: '28px',
            }}>✓</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--c-100)', marginBottom: '8px' }}>Salary Submitted!</h3>
            <p style={{ color: 'var(--c-400)', fontSize: '14px' }}>
              Thank you for contributing to salary transparency. Your submission helps others negotiate fairly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--c-300)', marginBottom: '8px' }}>Job Title</label>
              <input 
                name="job_title" 
                defaultValue={defaultTitle} 
                required 
                className="filter-input"
                placeholder="e.g. Software Engineer"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--c-300)', marginBottom: '8px' }}>Location</label>
              <input 
                name="location" 
                defaultValue={defaultLocation} 
                required 
                className="filter-input"
                placeholder="e.g. Lagos, Nigeria"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--c-300)', marginBottom: '8px' }}>Base Pay (NGN)</label>
                <input 
                  name="base_pay" 
                  type="number" 
                  required 
                  min="0"
                  className="filter-input"
                  placeholder="e.g. 5000000"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--c-300)', marginBottom: '8px' }}>Per</label>
                <select name="pay_period" className="filter-input" style={{ appearance: 'none' }}>
                  <option value="yearly">Year</option>
                  <option value="monthly">Month</option>
                  <option value="hourly">Hour</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--c-300)', marginBottom: '8px' }}>Bonus / Equity (Optional)</label>
                <input 
                  name="bonus_pay" 
                  type="number" 
                  min="0"
                  className="filter-input"
                  placeholder="0"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--c-300)', marginBottom: '8px' }}>Years of Exp. (Optional)</label>
                <input 
                  name="years_experience" 
                  type="number" 
                  min="0"
                  max="50"
                  className="filter-input"
                  placeholder="e.g. 3"
                />
              </div>
            </div>

            <div style={{
              fontSize: '12px', color: 'var(--c-500)',
              background: 'var(--c-800)', padding: '12px',
              borderRadius: 'var(--r-md)', border: '1px solid var(--c-700)',
            }}>
              🔒 Your submission is 100% anonymous. It will be aggregated with other submissions to show market medians.
            </div>

            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: '12px',
              marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--c-800)',
            }}>
              <button type="button" onClick={onClose} className="btn btn--ghost" style={{ fontSize: '13px', padding: '10px 20px' }}>
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="btn btn--primary"
                style={{ fontSize: '13px', padding: '10px 20px', opacity: loading ? 0.5 : 1 }}
              >
                {loading ? 'Submitting...' : 'Submit Anonymous Salary'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
