'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AlertCircle, BriefcaseBusiness, Building2, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
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
  const maxDateOfBirth = new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0];

  if (isSuccess) {
    return (
      <div className="auth-centered-shell">
        <Link href="/" className="auth-centered-logo" aria-label="Tutaly home">
          <Image src="/logo.png" alt="Tutaly" width={140} height={40} />
        </Link>
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

      <aside className="auth-panel">
        <Link href="/" className="auth-panel__logo" aria-label="Tutaly home">
          <Image src="/logo.png" alt="Tutaly" width={140} height={40} />
        </Link>

        <div className="auth-panel__content">
          <div className="auth-panel__eyebrow">Built for work in Nigeria</div>
          <div className="auth-panel__quote">Create one account for career discovery, hiring, salary intelligence, trusted reviews, and professional commerce.</div>
          <p className="auth-panel__support">Choose the workspace that matches what you need today. You can still access Tutaly&apos;s public tools and marketplace.</p>
        </div>

        <div className="auth-panel__stats">
          <div className="auth-panel__stat">
            <div className="auth-panel__stat-num">Seeker</div>
            <div className="auth-panel__stat-label">Build your career</div>
          </div>
          <div className="auth-panel__stat">
            <div className="auth-panel__stat-num">Employer</div>
            <div className="auth-panel__stat-label">Build your team</div>
          </div>
        </div>
      </aside>

      <main className="auth-form-side reveal visible">
        <div className="auth-form-wrap">

          <Link href="/" className="auth-mobile-logo" aria-label="Tutaly home">
            <Image src="/logo.png" alt="Tutaly" width={140} height={40} />
          </Link>

          <h1 className="auth-heading">Create an account</h1>
          <p className="auth-subheading">
            Already have an account? <Link href="/auth/signin">Sign in here</Link>
          </p>

          <div className="role-toggle" role="radiogroup" aria-label="Account type">
            <button
              type="button"
              className={`role-option ${role === 'seeker' ? 'selected' : ''}`}
              onClick={() => setRole('seeker')}
              role="radio"
              aria-checked={role === 'seeker'}
            >
              <BriefcaseBusiness className="role-option__icon" aria-hidden="true" />
              <div className="role-option__title">Professional</div>
              <div className="role-option__desc">Find work and grow your career.</div>
            </button>
            <button
              type="button"
              className={`role-option ${role === 'employer' ? 'selected' : ''}`}
              onClick={() => setRole('employer')}
              role="radio"
              aria-checked={role === 'employer'}
            >
              <Building2 className="role-option__icon" aria-hidden="true" />
              <div className="role-option__title">Employer</div>
              <div className="role-option__desc">Hire talent and manage your company.</div>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="auth-alert" role="alert">
                <AlertCircle size={16} /> <span>{error}</span>
              </div>
            )}

            {role === 'seeker' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="first-name">First name <span className="required">*</span></label>
                  <input id="first-name" type="text" className="input" required autoComplete="given-name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="last-name">Last name <span className="required">*</span></label>
                  <input id="last-name" type="text" className="input" required autoComplete="family-name" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="form-field">
                <label className="form-label" htmlFor="company-name">Company name <span className="required">*</span></label>
                <input id="company-name" type="text" className="input" required autoComplete="organization" value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </div>
            )}

            <div className="form-field">
              <label className="form-label" htmlFor="signup-email">Email address <span className="required">*</span></label>
              <div className="input-wrap">
                <input id="signup-email" type="email" className="input" placeholder="you@example.com" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="signup-password">Password <span className="required">*</span></label>
              <div className="input-wrap">
                <input id="signup-password" type={showPassword ? 'text' : 'password'} className="input" placeholder="At least 8 characters" required autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
              </div>
              <div className="pw-strength">
                <div className={`pw-strength-bar ${strength >= 1 ? strengthClass : ''}`}></div>
                <div className={`pw-strength-bar ${strength >= 2 ? strengthClass : ''}`}></div>
                <div className={`pw-strength-bar ${strength >= 3 ? strengthClass : ''}`}></div>
                <div className={`pw-strength-bar ${strength >= 4 ? strengthClass : ''}`}></div>
              </div>
              {strength > 0 && <div className="pw-strength-label">{strengthLabel}</div>}
              <p className="field-hint">Use uppercase, lowercase, a number, and a special character.</p>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="date-of-birth">Date of birth <span className="required">*</span></label>
              <input id="date-of-birth" type="date" className="input" required max={maxDateOfBirth} autoComplete="bday" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
            </div>

            <div className="check-row" style={{ marginTop: '24px' }}>
              <input type="checkbox" id="terms" className="filter-checkbox" required checked={termsAgreed} onChange={e => setTermsAgreed(e.target.checked)} />
              <label htmlFor="terms">I agree to Tutaly&apos;s <Link href="/legal/terms-of-service">Terms of Service</Link> and <Link href="/legal/privacy-policy">Privacy Policy</Link>.</label>
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
