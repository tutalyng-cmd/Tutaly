'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

function MfaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('uid');
  const mfaToken = searchParams.get('mfa');

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId || !mfaToken) {
      router.push('/auth/signin');
    }
  }, [userId, mfaToken, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-mfa', {
        userId,
        mfaToken,
        code,
      });

      // Store tokens and user locally
      localStorage.setItem('access_token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      router.push('/dashboard');
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = e as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
setError(error.response?.data?.message || 'Invalid OTP code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-c900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center p-4 bg-green/20 rounded-full mb-6"
        >
          <ShieldCheck className="h-10 w-10 text-green" />
        </motion.div>
        <h2 className="text-3xl font-extrabold text-white">Two-Factor Auth</h2>
        <p className="mt-2 text-sm text-c400">
          We sent a 6-digit code to your registered email.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/10"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red/10 border border-red/50 text-red p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-c300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="block w-full text-center text-3xl tracking-widest font-bold py-3 border border-white/10 rounded-xl bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-green transition-all"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length < 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-green hover:from-green  transition-all disabled:opacity-50 disabled:cursor-not-allowed items-center"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  Verify & Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/auth/signin')}
              className="text-sm font-medium text-c400 hover:text-white transition-colors flex items-center justify-center mx-auto"
            >
              Back to Sign In
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function MfaPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-c900 flex items-center justify-center">
         <Loader2 className="animate-spin h-10 w-10 text-green" />
       </div>
    }>
      <MfaContent />
    </Suspense>
  );
}
