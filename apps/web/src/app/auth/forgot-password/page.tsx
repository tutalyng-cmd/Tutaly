'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setIsSuccess(true);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-centered-shell">
      <Link href="/" className="auth-centered-logo">
        <img src="/images/tutaly-icon-mark.png" alt="Tutaly" />
      </Link>

      <div className="auth-centered-wrap">
        {!isSuccess && (
          <Link href="/auth/signin" className="auth-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back to sign in
          </Link>
        )}

        {isSuccess ? (
          <div className="text-center">
            <div className="auth-success-icon mx-auto">
              <CheckCircle2 style={{ width: '28px', height: '28px', color: 'var(--green)' }} />
            </div>
            <h1 className="auth-heading">Check your inbox</h1>
            <p className="auth-subheading" style={{ marginBottom: '24px' }}>
              If an account exists for {email}, you will receive a password reset link shortly.
            </p>
            <Link href="/auth/signin" className="btn btn--primary btn--full">
              Return to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 className="auth-heading">Reset your password</h1>
            <p className="auth-subheading">Enter the email address linked to your account and we'll send you a link to reset your password.</p>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="field-error" style={{ marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <div className="form-field">
                <label className="form-label" htmlFor="reset-email">Email address <span className="required">*</span></label>
                <div className="input-wrap input-wrap--icon">
                  <span className="input-icon">
                    <Mail style={{ width: '16px', height: '16px' }} />
                  </span>
                  <input 
                    className="input" 
                    type="email" 
                    id="reset-email" 
                    placeholder="you@example.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading || !email}
                className="btn btn--primary btn--lg btn--full flex justify-center items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <p className="auth-footer-note">Remembered your password? <Link href="/auth/signin" style={{ fontWeight: 600 }}>Sign in</Link></p>
          </>
        )}
      </div>
    </div>
  );
}
