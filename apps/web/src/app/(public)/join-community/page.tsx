import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Users, MessageSquare, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Join the Connect Community',
  description: 'Network with Nigerian professionals, share your career journey, and discover new opportunities on Tutaly Connect.',
};

export default function JoinCommunityPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      {/* Hero */}
      <section className="bg-navy py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Your Professional Network, Built for Nigeria
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light">
            Tutaly Connect is a safe, transparent community where professionals share career advice, discuss salaries, and network without the noise.
          </p>
          <Link 
            href="/auth/signup?role=seeker" 
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-blue-500 hover:-translate-y-1 transition-all"
          >
            Join Connect for Free <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400 font-medium">
            <span className="flex items-center gap-2"><Users className="w-5 h-5 text-blue-400" /> 10,000+ Members</span>
            <span className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-400" /> Daily Discussions</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">More Than Just a Job Board</h2>
            <p className="text-lg text-gray-600 mb-8">
              We built Connect because we realized that the best career moves come from authentic conversations, not just applying to listings.
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="mt-1 shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Real Conversations</h4>
                  <p className="text-gray-600">Ask questions about company culture, interview processes, and career transitions. Get answers from people who actually work there.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="mt-1 shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Build Your Network</h4>
                  <p className="text-gray-600">Follow industry leaders, connect with peers, and discover mentors. Your network is your net worth.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="mt-1 shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Safe & Supportive</h4>
                  <p className="text-gray-600">Strict community guidelines ensure that discussions remain professional, helpful, and respectful at all times.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-teal-50 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-teal-400"></div>
                <div>
                  <h5 className="font-bold text-gray-900">David O.</h5>
                  <p className="text-xs text-gray-500">Software Engineer @ Fintech Startup</p>
                </div>
              </div>
              <p className="text-gray-700 text-lg italic mb-6">
                "Before an interview, I asked the Connect community what to expect from the technical round. Three current employees gave me tips that helped me land the job. It's the most helpful platform I've used."
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Verified Member
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to accelerate your career?</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join the fastest-growing professional community in Nigeria. Sign up in seconds.
          </p>
          <Link 
            href="/auth/signup?role=seeker" 
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-opacity-90 hover:-translate-y-1 transition-all"
          >
            Create Your Profile
          </Link>
        </div>
      </section>
    </div>
  );
}
