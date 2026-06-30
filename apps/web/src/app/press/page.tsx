import Link from "next/link";

export const metadata = {
  title: "Press - Tutaly",
  description: "Press releases, media assets, and news about Tutaly.",
};

export default function PressPage() {
  return (
    <main>
      <section className="hero">
        <div className="container relative text-center">
          <div className="hero__eyebrow justify-center">
            <div className="hero__eyebrow-line" aria-hidden="true"></div>
            <span>Press & Media</span>
          </div>
          <h1 className="hero__title mx-auto max-w-layout-lg">Tutaly in the news.</h1>
          <p className="hero__subtitle mx-auto">
            Resources for journalists, bloggers, and partners.
          </p>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-c100 mb-6">Recent Press Releases</h2>
              
              <div className="space-y-6">
                <article className="border-b border-c700 pb-6">
                  <div className="text-c400 text-sm mb-2">June 15, 2024</div>
                  <h3 className="text-xl font-bold text-c100 mb-3"><Link href="#" className="hover:text-blue transition-colors">Tutaly Reaches 100,000 Verified Professionals Globally</Link></h3>
                  <p className="text-c300 mb-4">The global professional ecosystem announces a major milestone as it continues to expand its tools for salary intelligence and career growth.</p>
                  <Link href="#" className="text-blue font-medium text-sm hover:text-blueL inline-flex items-center gap-1">Read full release &rarr;</Link>
                </article>

                <article className="border-b border-c700 pb-6">
                  <div className="text-c400 text-sm mb-2">March 22, 2024</div>
                  <h3 className="text-xl font-bold text-c100 mb-3"><Link href="#" className="hover:text-blue transition-colors">Tutaly Launches Mentorship Marketplace to Bridge the Gap Between Talent and Opportunity</Link></h3>
                  <p className="text-c300 mb-4">A new platform feature allows professionals to book 1-on-1 sessions with industry leaders for coaching and interview preparation.</p>
                  <Link href="#" className="text-blue font-medium text-sm hover:text-blueL inline-flex items-center gap-1">Read full release &rarr;</Link>
                </article>

                <article className="border-b border-c700 pb-6">
                  <div className="text-c400 text-sm mb-2">January 10, 2024</div>
                  <h3 className="text-xl font-bold text-c100 mb-3"><Link href="#" className="hover:text-blue transition-colors">Tutaly Raises $10M Series A to Democratize Career Intelligence</Link></h3>
                  <p className="text-c300 mb-4">Funding will be used to expand into new markets and build out the company's enterprise hiring solutions.</p>
                  <Link href="#" className="text-blue font-medium text-sm hover:text-blueL inline-flex items-center gap-1">Read full release &rarr;</Link>
                </article>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-c800 border border-c700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-c100 mb-4">Media Inquiries</h3>
                <p className="text-c300 text-sm mb-6">For press inquiries, interview requests, or further information, please contact our PR team.</p>
                <Link href="mailto:press@tutaly.com" className="btn btn--primary w-full justify-center">press@tutaly.com</Link>
              </div>

              <div className="bg-c800 border border-c700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-c100 mb-4">Brand Assets</h3>
                <p className="text-c300 text-sm mb-6">Download official Tutaly logos, product screenshots, and executive headshots.</p>
                <Link href="#" className="btn btn--ghost w-full justify-center">Download Press Kit (ZIP)</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
