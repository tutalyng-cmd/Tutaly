'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(!token ? 'error' : 'loading');
  const [message, setMessage] = useState(!token ? 'No verification token provided.' : '');

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Your email has been successfully verified!');
      } catch (e) {
        const err = e as { response?: { data?: { message?: string } } };
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification link is invalid or has expired.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="auth-centered-shell">
      <Link href="/" className="auth-centered-logo">
        <img src="/images/tutaly-icon-mark.png" alt="Tutaly" />
      </Link>
      
      <div className="auth-centered-wrap text-center">
        {status === 'loading' && (
          <div>
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-green" style={{ marginBottom: '24px' }} />
            <h1 className="auth-heading">Verifying your email</h1>
            <p className="auth-subheading">Please wait while we confirm your account...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="auth-success-icon mx-auto">
              <CheckCircle2 style={{ width: '28px', height: '28px', color: 'var(--green)' }} />
            </div>
            <h1 className="auth-heading">Email Verified!</h1>
            <p className="auth-subheading" style={{ marginBottom: '8px' }}>{message}</p>
            <p style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 600, marginBottom: '24px' }}>
              Next: Sign in to receive your secure login code.
            </p>
            <Link href="/auth/signin" className="btn btn--primary btn--full">Go to Sign in</Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="auth-success-icon mx-auto bg-red/10 border border-red/20">
              <XCircle style={{ width: '28px', height: '28px', color: 'var(--red)' }} />
            </div>
            <h1 className="auth-heading">Verification Failed</h1>
            <p className="auth-subheading" style={{ marginBottom: '24px' }}>{message}</p>
            <Link href="/auth/signup" className="btn btn--primary btn--full">Create New Account</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="auth-centered-shell">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-green" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
