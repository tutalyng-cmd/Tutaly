import Link from "next/link";

export const metadata = {
  title: "Careers - Join Tutaly",
  description: "Help us build the global professional ecosystem. We're hiring across engineering, product, design, and more.",
};

export default function CareersPage() {
  return (
    <main>
      <section className="hero">
        <div className="container relative text-center">
          <div className="hero__eyebrow justify-center">
            <div className="hero__eyebrow-line" aria-hidden="true"></div>
            <span>Careers at Tutaly</span>
          </div>
          <h1 className="hero__title mx-auto max-w-layout-lg">Build the future of work with us.</h1>
          <p className="hero__subtitle mx-auto">
            We are a fully distributed team building tools to give professionals leverage in their careers.
          </p>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container max-w-layout-lg">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-c100 mb-6">Open Roles</h2>
            
            <div className="space-y-4">
              {/* Job 1 */}
              <Link href="#" className="block bg-c800 border border-c700 rounded-xl p-6 hover:border-c600 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-c100 mb-1">Senior Frontend Engineer</h3>
                    <div className="flex items-center gap-3 text-sm text-c400">
                      <span>Engineering</span>
                      <span>&bull;</span>
                      <span>Remote (EMEA)</span>
                    </div>
                  </div>
                  <div className="text-blue font-medium text-sm">View Role &rarr;</div>
                </div>
              </Link>

              {/* Job 2 */}
              <Link href="#" className="block bg-c800 border border-c700 rounded-xl p-6 hover:border-c600 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-c100 mb-1">Product Manager</h3>
                    <div className="flex items-center gap-3 text-sm text-c400">
                      <span>Product</span>
                      <span>&bull;</span>
                      <span>Remote (Global)</span>
                    </div>
                  </div>
                  <div className="text-blue font-medium text-sm">View Role &rarr;</div>
                </div>
              </Link>

              {/* Job 3 */}
              <Link href="#" className="block bg-c800 border border-c700 rounded-xl p-6 hover:border-c600 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-c100 mb-1">Data Scientist (Salaries)</h3>
                    <div className="flex items-center gap-3 text-sm text-c400">
                      <span>Data</span>
                      <span>&bull;</span>
                      <span>Remote (Americas)</span>
                    </div>
                  </div>
                  <div className="text-blue font-medium text-sm">View Role &rarr;</div>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-blue shadow-glow-blue rounded-2xl border border-blue p-8 text-center">
            <h3 className="text-xl font-bold text-c100 mb-3">Don't see a fit?</h3>
            <p className="text-c300 mb-6 max-w-layout-md mx-auto">We're always looking for exceptional talent. Send us your resume and tell us how you can help.</p>
            <Link href="mailto:careers@tutaly.com" className="btn btn--primary">Email Us</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
