'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api, setMemoryToken } from '@/lib/api';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/signin', { email, password });

      if (response.data.mfaRequired) {
        const params = new URLSearchParams();
        params.set('uid', response.data.userId);
        params.set('mfa', response.data.mfaToken);
        router.push(`/auth/mfa?${params.toString()}`);
        return;
      }

      setMemoryToken(response.data.accessToken);
      localStorage.setItem('access_token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      router.push('/dashboard');
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell">

      <aside className="auth-panel">
        <Link href="/" className="auth-panel__logo" aria-label="Tutaly home">
          <Image src="/logo.png" alt="Tutaly" width={140} height={40} />
        </Link>

        <div className="auth-panel__content">
          <div className="auth-panel__eyebrow">One professional identity</div>
          <div className="auth-panel__quote">Return to your jobs, applications, salary insights, marketplace orders, and professional community.</div>
          <p className="auth-panel__support">Tutaly keeps every part of your working life in one trusted Nigerian-first ecosystem.</p>
        </div>

        <div className="auth-panel__stats">
          <div className="auth-panel__stat">
            <div className="auth-panel__stat-num">Jobs</div>
            <div className="auth-panel__stat-label">Discover roles</div>
          </div>
          <div className="auth-panel__stat">
            <div className="auth-panel__stat-num">Salaries</div>
            <div className="auth-panel__stat-label">Know your worth</div>
          </div>
        </div>
      </aside>

      <main className="auth-form-side reveal visible">
        <div className="auth-form-wrap">
          <Link href="/" className="auth-mobile-logo" aria-label="Tutaly home">
            <Image src="/logo.png" alt="Tutaly" width={140} height={40} />
          </Link>

          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-subheading">
            Don't have an account? <Link href="/auth/signup">Create one today</Link>
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="auth-alert" role="alert">
                <AlertCircle size={16} /> <span>{error}</span>
              </div>
            )}

            <div className="form-field">
              <label className="form-label" htmlFor="email">
                Email address <span className="required">*</span>
              </label>
              <div className="input-wrap">
                <input
                  type="email"
                  id="email"
                  className="input"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="password">
                Password <span className="required">*</span>
              </label>
              <div className="input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="input"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="auth-row-between auth-row-between--end">
              <Link href="/auth/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>

            <button type="submit" disabled={isLoading} className="btn btn--primary btn--full flex justify-center items-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

        </div>
      </main>
    </div>
  );
}
