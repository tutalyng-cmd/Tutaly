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
        <Link href="/" className="auth-panel__logo">
          <img src="/images/tutaly-icon-mark.png" alt="Tutaly" />
        </Link>

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
          
          <Link href="/" className="auth-mobile-logo">
            <img src="/images/tutaly-icon-mark.png" alt="Tutaly" />
          </Link>

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

          <div className="auth-divider">Or continue with</div>

          <div className="social-row">
            <button type="button" className="btn--social">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button type="button" className="btn--social">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h11.03v-8.94H9.8v-3.48h3.01V9.03c0-2.98 1.82-4.6 4.48-4.6 1.27 0 2.37.09 2.68.14v3.11h-1.83c-1.45 0-1.73.69-1.73 1.7v2.23h3.44l-.45 3.48h-2.99V24h5.83C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.23 0z"/></svg>
              LinkedIn
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
