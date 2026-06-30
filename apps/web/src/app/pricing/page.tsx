import Link from "next/link";
import { Check } from "lucide-react";

export const metadata = {
  title: "Pricing - Tutaly for Employers",
  description: "Simple, transparent pricing for hiring global talent. Post jobs and find the best candidates on Tutaly.",
};

export default function PricingPage() {
  return (
    <main>
      <section className="hero">
        <div className="container relative text-center">
          <div className="hero__eyebrow justify-center">
            <div className="hero__eyebrow-line" aria-hidden="true"></div>
            <span>Pricing</span>
          </div>
          <h1 className="hero__title mx-auto max-w-layout-lg">Simple pricing for teams of all sizes.</h1>
          <p className="hero__subtitle mx-auto">
            Find and hire world-class talent without the agency fees.
          </p>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-layout-xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-c800 rounded-2xl border border-c700 p-8 flex flex-col h-full hover:border-c600 transition-colors">
              <h3 className="text-xl font-bold text-c100 mb-2">Starter</h3>
              <p className="text-c400 text-sm mb-6 h-10">Perfect for growing startups making their first few hires.</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-c100">₦25,000</span>
                <span className="text-c400"> /post</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green shrink-0 mt-0.5" />
                  <span className="text-c200 text-sm">30-day active listing</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green shrink-0 mt-0.5" />
                  <span className="text-c200 text-sm">Standard support</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green shrink-0 mt-0.5" />
                  <span className="text-c200 text-sm">Basic applicant tracking</span>
                </li>
              </ul>
              <Link href="/employer/jobs/create?plan=starter" className="btn btn--ghost w-full justify-center">Get Started</Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-c800 rounded-2xl border border-blue p-8 flex flex-col h-full relative shadow-lg transform md:-translate-y-4">
              <div className="absolute top-0 right-0 bg-blue text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">POPULAR</div>
              <h3 className="text-xl font-bold text-c100 mb-2">Pro</h3>
              <p className="text-c400 text-sm mb-6 h-10">For companies scaling their teams aggressively.</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-c100">₦75,000</span>
                <span className="text-c400"> /post</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green shrink-0 mt-0.5" />
                  <span className="text-c200 text-sm">45-day active listing</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green shrink-0 mt-0.5" />
                  <span className="text-c200 text-sm">Priority support</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green shrink-0 mt-0.5" />
                  <span className="text-c200 text-sm">Advanced applicant tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green shrink-0 mt-0.5" />
                  <span className="text-c200 text-sm">Featured in top email newsletter</span>
                </li>
              </ul>
              <Link href="/employer/jobs/create?plan=pro" className="btn btn--primary w-full justify-center">Get Started</Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-c800 rounded-2xl border border-c700 p-8 flex flex-col h-full hover:border-c600 transition-colors">
              <h3 className="text-xl font-bold text-c100 mb-2">Enterprise</h3>
              <p className="text-c400 text-sm mb-6 h-10">Custom solutions for volume hiring and large organizations.</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-c100">Custom</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green shrink-0 mt-0.5" />
                  <span className="text-c200 text-sm">Unlimited listings</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green shrink-0 mt-0.5" />
                  <span className="text-c200 text-sm">Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green shrink-0 mt-0.5" />
                  <span className="text-c200 text-sm">ATS integrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green shrink-0 mt-0.5" />
                  <span className="text-c200 text-sm">Custom employer branding</span>
                </li>
              </ul>
              <Link href="/contact" className="btn btn--ghost w-full justify-center">Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
