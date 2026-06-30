'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/signin', { email, password });
      
      if (response.data.mfaRequired) {
        // Important: Keep loading true while redirecting
        const params = new URLSearchParams();
        params.set('uid', response.data.userId);
        params.set('mfa', response.data.mfaToken);
        router.push(`/auth/mfa?${params.toString()}`);
        return;
      }

      // Store token in localStorage (refresh token is handled by HttpOnly cookie)
      localStorage.setItem('access_token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      router.push('/dashboard');
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = e as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
setError(error.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--c-100)' }}>
             Welcome back to <span style={{ color: 'var(--blue-l)' }}>Tutaly</span>
          </h2>
          <p style={{ color: 'var(--c-400)', marginTop: '8px' }}>
            Sign in to access your dashboard
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-c800 border border-c700 rounded-xl px-6 py-8 shadow-2xl"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red/10 border border-red/30 text-red p-3 rounded-md text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--c-300)', marginBottom: '8px' }}>
                Email address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-c500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--c-300)' }}>
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-xs font-semibold text-blueL hover:text-blue transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-c500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div style={{ paddingTop: '8px' }}>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn--primary btn--lg w-full flex justify-center group"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <span className="flex items-center">
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div style={{ width: '100%', borderTop: '1px solid var(--c-700)' }} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span style={{ padding: '0 8px', background: 'var(--c-800)', color: 'var(--c-400)' }}>
                  New to Tutaly?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/auth/signup" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-100)' }} className="hover:text-blueL transition-colors">
                Create an account
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
