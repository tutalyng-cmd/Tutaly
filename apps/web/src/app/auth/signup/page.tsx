'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

type Role = 'seeker' | 'employer';

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [role, setRole] = useState<Role>('seeker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAgreed) {
      setError('You must agree to the Terms of Service.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const payload = {
        email,
        password,
        role,
        dateOfBirth,
        recaptchaToken: 'mock_token_for_dev',
        ...(role === 'seeker' ? { firstName, lastName } : { companyName }),
      };

      await api.post('/auth/register', payload);
      setIsSuccess(true);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const strength = getPasswordStrength();
  const strengthClass = strength === 0 ? '' : strength < 3 ? 'filled-weak' : strength === 3 ? 'filled-mid' : 'filled-strong';
  const strengthLabel = strength === 0 ? '' : strength < 3 ? 'Weak password' : strength === 3 ? 'Good password' : 'Strong password';

  if (isSuccess) {
    return (
      <div className="auth-centered-shell">
        {/* <Link href="/" className="auth-centered-logo">
          <img src="/logo.png" alt="Tutaly" />
        </Link> */}
        <div className="auth-centered-wrap text-center">
          <div className="auth-success-icon mx-auto">
            <CheckCircle2 style={{ width: '28px', height: '28px', color: 'var(--green)' }} />
          </div>
          <h1 className="auth-heading">Check your email</h1>
          <p className="auth-subheading" style={{ marginBottom: '24px' }}>
            We&apos;ve sent a verification link to <span style={{ color: 'var(--c-100)', fontWeight: 500 }}>{email}</span>.
          </p>
          <Link href="/auth/signin" className="btn btn--primary btn--full">Go to Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">

      {/* LEFT BRANDED PANEL */}
      <aside className="auth-panel">
        <Link href="/" className="auth-panel__logo">
          <img src="/logo.png" alt="Tutaly" />
        </Link>

        <div className="auth-panel__content">
          <div className="auth-panel__quote">
            &quot;We filled our senior engineering roles 40% faster using Tutaly&apos;s verified talent pool. It&apos;s the only platform we trust.&quot;
          </div>
          <div className="auth-panel__author">
            <div className="auth-panel__avatar" style={{ background: 'var(--green)' }}>AJ</div>
            <div>
              <div className="auth-panel__name">Amira Johnson</div>
              <div className="auth-panel__title">Head of Talent, FinTech Africa</div>
            </div>
          </div>
        </div>

        <div className="auth-panel__stats">
          <div className="auth-panel__stat">
            <div className="auth-panel__stat-num">50k+</div>
            <div className="auth-panel__stat-label">Active Professionals</div>
          </div>
          <div className="auth-panel__stat">
            <div className="auth-panel__stat-num">98%</div>
            <div className="auth-panel__stat-label">Response Rate</div>
          </div>
        </div>
      </aside>

      {/* RIGHT FORM PANEL */}
      <main className="auth-form-side reveal visible">
        <div className="auth-form-wrap">

          {/* <Link href="/" className="auth-mobile-logo">
            <img src="/logo.png" alt="Tutaly" />
          </Link> */}

          <h1 className="auth-heading">Create an account</h1>
          <p className="auth-subheading">
            Already have an account? <Link href="/auth/signin">Sign in here</Link>
          </p>

          <div className="role-toggle">
            <div
              className={`role-option ${role === 'seeker' ? 'selected' : ''}`}
              onClick={() => setRole('seeker')}
              tabIndex={0}
            >
              <span className="role-option__icon">👩‍💻</span>
              <div className="role-option__title">Professional</div>
              <div className="role-option__desc">Share salaries, leave reviews.</div>
            </div>
            <div
              className={`role-option ${role === 'employer' ? 'selected' : ''}`}
              onClick={() => setRole('employer')}
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

            {role === 'seeker' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label className="form-label">First Name <span className="required">*</span></label>
                  <input type="text" className="input" required value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label className="form-label">Last Name <span className="required">*</span></label>
                  <input type="text" className="input" required value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="form-field">
                <label className="form-label">Company Name <span className="required">*</span></label>
                <input type="text" className="input" required value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </div>
            )}

            <div className="form-field">
              <label className="form-label">Work Email <span className="required">*</span></label>
              <div className="input-wrap">
                <input type="email" className="input" placeholder="you@company.com" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Password <span className="required">*</span></label>
              <div className="input-wrap">
                <input type={showPassword ? 'text' : 'password'} className="input" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'HIDE' : 'SHOW'}</button>
              </div>
              <div className="pw-strength">
                <div className={`pw-strength-bar ${strength >= 1 ? strengthClass : ''}`}></div>
                <div className={`pw-strength-bar ${strength >= 2 ? strengthClass : ''}`}></div>
                <div className={`pw-strength-bar ${strength >= 3 ? strengthClass : ''}`}></div>
                <div className={`pw-strength-bar ${strength >= 4 ? strengthClass : ''}`}></div>
              </div>
              {strength > 0 && <div className="pw-strength-label">{strengthLabel}</div>}
            </div>

            <div className="form-field">
              <label className="form-label">Date of Birth <span className="required">*</span></label>
              <input type="date" className="input" required value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
            </div>

            <div className="check-row" style={{ marginTop: '24px' }}>
              <input type="checkbox" id="terms" className="filter-checkbox" required checked={termsAgreed} onChange={e => setTermsAgreed(e.target.checked)} />
              <label htmlFor="terms">I agree to Tutaly&apos;s <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>.</label>
            </div>

            <button type="submit" disabled={isLoading} className="btn btn--primary btn--full flex justify-center items-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

        </div>
      </main>
    </div>
  );
}
