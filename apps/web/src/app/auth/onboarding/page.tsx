'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function Onboarding() {
  const router = useRouter();
  const [role, setRole] = useState<'seeker' | 'employer'>('seeker');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!termsAgreed) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      setIsLoading(false);
      return;
    }

    try {
      await api.put('/auth/onboarding', {
        role,
        dateOfBirth,
        ...(role === 'employer' ? { companyName, industry } : {}),
      });

      // Update local storage user object
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.role = role;
        user.isOnboardingComplete = true;
        localStorage.setItem('user', JSON.stringify(user));
      }

      router.push('/dashboard');
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Onboarding failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <main className="auth-form-side reveal visible" style={{ margin: '0 auto' }}>
        <div className="auth-form-wrap">
          
          <Link href="/" className="auth-mobile-logo">
            <img src="/logo.png" alt="Tutaly" />
          </Link>

          <h1 className="auth-heading">Complete your profile</h1>
          <p className="auth-subheading">
            Just a few more details to set up your account.
          </p>

          <div className="role-selector" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div 
              className={`role-option ${role === 'seeker' ? 'active' : ''}`}
              onClick={() => setRole('seeker')}
              role="button"
              tabIndex={0}
            >
              <span className="role-option__icon">👋</span>
              <div className="role-option__title">Job Seeker</div>
              <div className="role-option__desc">Find jobs, leave reviews.</div>
            </div>
            
            <div 
              className={`role-option ${role === 'employer' ? 'active' : ''}`}
              onClick={() => setRole('employer')}
              role="button"
              tabIndex={0}
            >
              <span className="role-option__icon">🏢</span>
              <div className="role-option__title">Employer</div>
              <div className="role-option__desc">Post jobs, build brand.</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="field-error" style={{ marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {role === 'employer' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label className="form-label">Company Name <span className="required">*</span></label>
                  <input type="text" className="input" required value={companyName} onChange={e => setCompanyName(e.target.value)} />
                </div>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label className="form-label">Industry <span className="required">*</span></label>
                  <input type="text" className="input" required value={industry} onChange={e => setIndustry(e.target.value)} />
                </div>
              </div>
            )}

            <div className="form-field">
              <label className="form-label">Date of Birth <span className="required">*</span></label>
              <input type="date" className="input" required value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
              <p className="form-hint" style={{ marginTop: '4px', fontSize: '12px', color: 'var(--gray-500)' }}>You must be at least 18 years old.</p>
            </div>

            <div className="check-row" style={{ marginTop: '24px' }}>
              <input type="checkbox" id="terms" className="filter-checkbox" required checked={termsAgreed} onChange={e => setTermsAgreed(e.target.checked)} />
              <label htmlFor="terms">I agree to Tutaly&apos;s <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>.</label>
            </div>

            <button type="submit" disabled={isLoading} className="btn btn--primary btn--full flex justify-center items-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Completing...' : 'Complete Profile'}
            </button>
          </form>

        </div>
      </main>
    </div>
  );
}
