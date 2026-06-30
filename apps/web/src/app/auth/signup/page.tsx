'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Mail, Lock, Calendar, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

type Role = 'seeker' | 'employer' | '';

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [role, setRole] = useState<Role>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        email,
        password,
        role,
        dateOfBirth,
        recaptchaToken: 'mock_token_for_dev', // To replace with actual reCAPTCHA integration
        ...(role === 'seeker' ? { firstName, lastName } : { companyName }),
      };

      await api.post('/auth/register', payload);
      setIsSuccess(true);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = e as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
setError(error.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    if (isSuccess) {
      return (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green/20 mb-6">
            <CheckCircle2 className="h-10 w-10 text-green" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Check your email</h3>
          <p className="text-c400 mb-8">
            We&apos;ve sent a verification link to <span className="text-white font-medium">{email}</span>.
          </p>
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-green hover:bg-green transition-all"
          >
            Go to Sign In
          </Link>
        </motion.div>
      );
    }

    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">How do you want to use Tutaly?</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div
                onClick={() => setRole('seeker')}
                className={`relative rounded-xl border p-6 cursor-pointer flex flex-col items-center text-center transition-all ${
                  role === 'seeker' ? 'border-green bg-green/10 shadow-lg shadow-green/30' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <User className={`h-8 w-8 mb-3 ${role === 'seeker' ? 'text-green' : 'text-c400'}`} />
                <h3 className="text-lg font-semibold text-white">I&apos;m a Job Seeker</h3>
                <p className="text-sm text-c400 mt-2">Looking for flexible or full-time opportunities.</p>
              </div>

              <div
                onClick={() => setRole('employer')}
                className={`relative rounded-xl border p-6 cursor-pointer flex flex-col items-center text-center transition-all ${
                  role === 'employer' ? 'border-green bg-green/10 shadow-lg shadow-green/30' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <Briefcase className={`h-8 w-8 mb-3 ${role === 'employer' ? 'text-green' : 'text-c400'}`} />
                <h3 className="text-lg font-semibold text-white">I&apos;m an Employer</h3>
                <p className="text-sm text-c400 mt-2">Looking to hire talented professionals.</p>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!role}
              className="btn btn--primary btn--lg w-full mt-8"
            >
              Continue
            </button>
          </motion.div>
        );
      
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {role === 'seeker' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-c300">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 block w-full px-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-c100 placeholder-gray-500 focus:outline-none focus:border-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-c300">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 block w-full px-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-c100 placeholder-gray-500 focus:outline-none focus:border-green"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-c300">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1 block w-full px-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-c100 placeholder-gray-500 focus:outline-none focus:border-green"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-c300">Date of Birth (Must be 18+)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-c400" />
                </div>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-c100 placeholder-gray-500 focus:outline-none focus:border-green"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="btn btn--ghost w-1/3"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={role === 'seeker' ? (!firstName || !lastName || !dateOfBirth) : (!companyName || !dateOfBirth)}
                className="btn btn--primary w-2/3"
              >
                Continue
              </button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {error && (
              <div className="bg-red/10 border border-red/50 text-red p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-c300">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-c400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-c100 placeholder-gray-500 focus:outline-none focus:border-green"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-c300">Password (Min. 8 chars)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-c400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-c100 placeholder-gray-500 focus:outline-none focus:border-green"
                  required
                />
              </div>
            </div>

            <p className="text-xs text-c500">
              By registering, you agree to our <Link href="/terms" className="text-green hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-green hover:underline">Privacy Policy</Link>. This site is protected by reCAPTCHA v3.
            </p>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="btn btn--ghost w-1/3"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!email || password.length < 8 || isLoading}
                className="btn btn--primary w-2/3"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}
              </button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--c-100)' }}>Join <span style={{ color: 'var(--blue-l)' }}>Tutaly</span></h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-c800 border border-c700 rounded-xl px-6 py-8 shadow-2xl">
          
          {!isSuccess && (
            <div className="mb-6 flex justify-between items-center px-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center w-full">
                  <div style={{ height: '8px', width: '100%', borderRadius: '999px', background: i <= step ? 'var(--blue-l)' : 'var(--c-700)', transition: 'background 0.3s' }} />
                </div>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {!isSuccess && (
            <div className="mt-6 text-center">
              <p style={{ fontSize: '14px', color: 'var(--c-400)' }}>
                Already have an account?{' '}
                <Link href="/auth/signin" style={{ fontWeight: 600, color: 'var(--c-100)' }} className="hover:text-blueL transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
