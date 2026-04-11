import Link from "next/link";

export default function Footer() {
  const legalLinks = [
    { name: "Terms of Service", href: "/legal/terms-of-service" },
    { name: "Privacy Policy", href: "/legal/privacy-policy" },
    { name: "Disclaimer", href: "/legal/disclaimer" },
    { name: "Community Guidelines", href: "/legal/community-guidelines" },
    { name: "Review Policy", href: "/legal/review-policy" },
    { name: "Marketplace Policy", href: "/legal/marketplace-policy" },
    { name: "Refund Policy", href: "/legal/refund-policy" },
    { name: "Advertiser Policy", href: "/legal/advertiser-policy" },
    { name: "Employer Policy", href: "/legal/employer-policy" },
    { name: "Cookie Policy", href: "/legal/cookie-policy" },
    { name: "Safety", href: "/legal/safety" },
  ];

  return (
    <footer className="w-full border-t border-gray-200 bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary">TUTALY</h3>
            <p className="text-sm text-gray-600">
              Connecting job seekers and employers seamlessly across Nigeria.
            </p>
          </div>

          {/* Site Links */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Legal & Policies
              </h4>
              <ul className="space-y-2">
                {legalLinks.slice(0, 6).map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-600 hover:text-accent-teal">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                More info
              </h4>
              <ul className="space-y-2">
                {legalLinks.slice(6).map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-600 hover:text-accent-teal">
                      {link.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/legal/about-us" className="text-sm text-gray-600 hover:text-accent-teal">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/legal/contact-us" className="text-sm text-gray-600 hover:text-accent-teal">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter / Social Placeholder */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Community
            </h4>
            <p className="text-sm text-gray-600">
              Join our professional network to stay ahead.
            </p>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Tutaly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
