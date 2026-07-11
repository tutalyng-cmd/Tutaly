import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="footer" aria-label="Site footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand-name">
              <Image src="/logo.png" alt="Tutaly" width={140} height={40} className="h-8 w-auto object-contain" />
            </div>
            <p className="footer__brand-desc">The professional ecosystem for the world's workforce. Find jobs, understand your market value, and build the career you deserve — wherever you are.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href="#" className="btn btn--ghost btn--sm" aria-label="Follow Tutaly on Twitter" style={{ padding: '6px' }}>
                𝕏
              </a>
              <a href="#" className="btn btn--ghost btn--sm" aria-label="Follow Tutaly on LinkedIn" style={{ padding: '6px' }}>
                in
              </a>
              <a href="#" className="btn btn--ghost btn--sm" aria-label="Follow Tutaly on Instagram" style={{ padding: '6px' }}>
                ig
              </a>
            </div>
          </div>
          <nav aria-label="For professionals">
            <div className="footer__col-title">For professionals</div>
            <ul className="footer__links">
              <li><Link href="/jobs">Find jobs</Link></li>
              <li><Link href="/salaries">Salary check</Link></li>
              <li><Link href="/reviews">Company reviews</Link></li>
              <li><Link href="/community">Network</Link></li>
              <li><Link href="/shop">Shop</Link></li>
            </ul>
          </nav>
          <nav aria-label="For employers">
            <div className="footer__col-title">For employers</div>
            <ul className="footer__links">
              <li><Link href="/free-job-posting">Post a job</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/advertise">Advertise</Link></li>
              <li><Link href="/employer">Dashboard</Link></li>
            </ul>
          </nav>
          <nav aria-label="Company links">
            <div className="footer__col-title">Company</div>
            <ul className="footer__links">
              <li><Link href="/about">About Tutaly</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/careers">We're hiring</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/press">Press</Link></li>
            </ul>
          </nav>
        </div>
        <div className="footer__bottom">
          <p className="footer__copy">© {new Date().getFullYear()} Tutaly. All rights reserved. Started in Lagos, building for everywhere.</p>
          <div className="footer__legal flex flex-wrap gap-4 justify-center md:justify-end text-sm text-c500">
            <Link href="/legal/terms-of-service" className="hover:text-green transition-colors">Terms of Service</Link>
            <Link href="/legal/privacy-policy" className="hover:text-green transition-colors">Privacy Policy</Link>
            <Link href="/legal/disclaimer" className="hover:text-green transition-colors">Disclaimer</Link>
            <Link href="/legal/community-guidelines" className="hover:text-green transition-colors">Community Guidelines</Link>
            <Link href="/legal/safety" className="hover:text-green transition-colors">Safety</Link>
            <Link href="/legal/review-policy" className="hover:text-green transition-colors">Review Policy</Link>
            <Link href="/legal/marketplace-policy" className="hover:text-green transition-colors">Marketplace Policy</Link>
            <Link href="/legal/refund-policy" className="hover:text-green transition-colors">Refund Policy</Link>
            <Link href="/legal/advertiser-policy" className="hover:text-green transition-colors">Advertiser Policy</Link>
            <Link href="/legal/employer-policy" className="hover:text-green transition-colors">Employer Policy</Link>
            <Link href="/legal/cookies" className="hover:text-green transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
