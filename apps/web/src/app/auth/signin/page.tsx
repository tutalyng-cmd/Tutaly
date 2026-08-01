'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

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

      {/* LEFT BRANDED PANEL */}
      <aside className="auth-panel">
        {/* <Link href="/" className="auth-panel__logo">
          <img src="/logo.png" alt="Tutaly" />
        </Link> */}

        <div className="auth-panel__content">
          <div className="auth-panel__quote">
            "Tutaly helped me see what I was actually worth. The salary data gave me the confidence to negotiate a 30% bump."
          </div>
          <div className="auth-panel__author">
            <div className="auth-panel__avatar">OS</div>
            <div>
              <div className="auth-panel__name">Oluwatobi Salako</div>
              <div className="auth-panel__title">Senior Software Engineer</div>
            </div>
          </div>
        </div>

        <div className="auth-panel__stats">
          <div className="auth-panel__stat">
            <div className="auth-panel__stat-num">12k+</div>
            <div className="auth-panel__stat-label">Verified Salaries</div>
          </div>
          <div className="auth-panel__stat">
            <div className="auth-panel__stat-num">4.8</div>
            <div className="auth-panel__stat-label">Avg rating</div>
          </div>
        </div>
      </aside>

      {/* RIGHT FORM PANEL */}
      <main className="auth-form-side reveal visible">
        <div className="auth-form-wrap">

          {/* <Link href="/" className="auth-mobile-logo">
            <img src="/logo.png" alt="Tutaly" />
          </Link> */}

          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-subheading">
            Don't have an account? <Link href="/auth/signup">Create one today</Link>
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="field-error" style={{ marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <div className="form-field">
              <label className="form-label" htmlFor="email">
                Work Email <span className="required">*</span>
              </label>
              <div className="input-wrap">
                <input
                  type="email"
                  id="email"
                  className="input"
                  placeholder="you@company.com"
                  required
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <div className="auth-row-between">
              <div className="check-row">
                <input type="checkbox" id="remember" className="filter-checkbox" />
                <label htmlFor="remember">Remember for 30 days</label>
              </div>
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
