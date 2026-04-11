'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Your email has been successfully verified!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification link is invalid or has expired.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="bg-white/10 backdrop-blur-lg py-12 px-8 shadow-2xl sm:rounded-2xl border border-white/10 text-center max-w-md w-full mx-auto">
      {status === 'loading' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-[#1D9E75] animate-spin mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Verifying your email</h2>
          <p className="text-gray-400">Please wait while we confirm your account...</p>
        </motion.div>
      )}

      {status === 'success' && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 mb-6">
            <CheckCircle2 className="h-10 w-10 text-[#1D9E75]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
          <p className="text-gray-400 mb-8">{message}</p>
          <Link
            href="/auth/signin"
            className="w-full inline-flex justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#1D9E75] to-[#147a59] focus:outline-none"
          >
            Go to Sign In
          </Link>
        </motion.div>
      )}

      {status === 'error' && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 mb-6">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
          <p className="text-gray-400 mb-8">{message}</p>
          <Link
            href="/auth/signup"
            className="w-full inline-flex justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#1D9E75] to-[#147a59] focus:outline-none"
          >
            Create New Account
          </Link>
        </motion.div>
      )}
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <div className="min-h-screen bg-[#0D1B2A] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="flex justify-center items-center">
           <Loader2 className="h-12 w-12 text-[#1D9E75] animate-spin" />
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
