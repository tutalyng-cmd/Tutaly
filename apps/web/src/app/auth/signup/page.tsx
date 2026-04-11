'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Mail, Lock, Calendar, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

type Role = 'seeker' | 'employer' | '';

export default function SignUp() {
  const router = useRouter();
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
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
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 mb-6">
            <CheckCircle2 className="h-10 w-10 text-[#1D9E75]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Check your email</h3>
          <p className="text-gray-400 mb-8">
            We've sent a verification link to <span className="text-white font-medium">{email}</span>.
          </p>
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#1D9E75] hover:bg-[#147a59] transition-all"
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
                  role === 'seeker' ? 'border-[#1D9E75] bg-[#1D9E75]/10 shadow-[0_0_15px_rgba(29,158,117,0.3)]' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <User className={`h-8 w-8 mb-3 ${role === 'seeker' ? 'text-[#1D9E75]' : 'text-gray-400'}`} />
                <h3 className="text-lg font-semibold text-white">I'm a Job Seeker</h3>
                <p className="text-sm text-gray-400 mt-2">Looking for flexible or full-time opportunities.</p>
              </div>

              <div
                onClick={() => setRole('employer')}
                className={`relative rounded-xl border p-6 cursor-pointer flex flex-col items-center text-center transition-all ${
                  role === 'employer' ? 'border-[#1D9E75] bg-[#1D9E75]/10 shadow-[0_0_15px_rgba(29,158,117,0.3)]' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <Briefcase className={`h-8 w-8 mb-3 ${role === 'employer' ? 'text-[#1D9E75]' : 'text-gray-400'}`} />
                <h3 className="text-lg font-semibold text-white">I'm an Employer</h3>
                <p className="text-sm text-gray-400 mt-2">Looking to hire talented professionals.</p>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!role}
              className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#1D9E75] to-[#147a59] focus:outline-none disabled:opacity-50 mt-8"
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
                  <label className="block text-sm font-medium text-gray-300">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 block w-full px-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#1D9E75]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 block w-full px-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#1D9E75]"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1 block w-full px-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#1D9E75]"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300">Date of Birth (Must be 18+)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#1D9E75]"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 flex justify-center py-3 px-4 rounded-xl text-sm font-bold text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={role === 'seeker' ? (!firstName || !lastName || !dateOfBirth) : (!companyName || !dateOfBirth)}
                className="w-2/3 flex justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#1D9E75] hover:bg-[#147a59] disabled:opacity-50"
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
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#1D9E75]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Password (Min. 8 chars)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#1D9E75]"
                  required
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              By registering, you agree to our <Link href="/terms" className="text-[#1D9E75] hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-[#1D9E75] hover:underline">Privacy Policy</Link>. This site is protected by reCAPTCHA v3.
            </p>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 flex justify-center py-3 px-4 rounded-xl text-sm font-bold text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!email || password.length < 8 || isLoading}
                className="w-2/3 flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-[#1D9E75] to-[#147a59] hover:from-[#147a59] hover:to-[#0f5c43] disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}
              </button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Join <span className="text-[#1D9E75]">Tutaly</span></h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/10 backdrop-blur-lg py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/10">
          
          {!isSuccess && (
            <div className="mb-6 flex justify-between items-center px-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center w-full">
                  <div className={`h-2 w-full rounded-full ${i <= step ? 'bg-[#1D9E75]' : 'bg-gray-700'} transition-all`} />
                </div>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {!isSuccess && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link href="/auth/signin" className="font-medium text-white hover:text-[#1D9E75] transition-colors">
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
