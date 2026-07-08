import Link from "next/link";

export const metadata = {
  title: "About Tutaly - The professional ecosystem for the world's workforce",
  description: "Learn about Tutaly's mission to help professionals understand their market value, find jobs, and build careers without borders.",
};

export default function AboutPage() {
  return (
    <main>
      <section className="hero">
        <div className="container relative">
          <div className="hero__eyebrow">
            <div className="hero__eyebrow-line" aria-hidden="true"></div>
            <span>About Tutaly</span>
          </div>
          <h1 className="hero__title">We believe talent is evenly distributed. Opportunity is not.</h1>
          <p className="hero__subtitle max-w-layout-md mx-auto">
            Welcome to Tutaly, where job seekers and employers connect seamlessly. Discover a multitude of available positions, access valuable company reviews, explore salary information, and find essential materials all in one place. As a prominent professional network, Tutaly also fosters connections among individuals. Join us to unlock limitless opportunities and forge meaningful relationships.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="reveal visible max-w-layout-lg mx-auto text-center">
            <h2 className="section__title">Our Story</h2>
            <p className="text-lg text-c300 leading-relaxed mb-8">
              We started Tutaly in Lagos because we saw a recurring problem: brilliant engineers, designers, and operators were walking into negotiations with no leverage and no visibility into what they were actually worth on the global stage.
            </p>
            <p className="text-lg text-c300 leading-relaxed mb-8">
              We built our salary intelligence tool first. Then came company reviews. Now, we're building the complete ecosystem where professionals can find jobs, understand their value, and build the career they deserve.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="reveal visible flex flex-wrap gap-12 items-center justify-between">
            <div className="max-w-layout-md">
              <div className="section__label">The Mission</div>
              <h2 className="section__title mb-4">Leveling the playing field.</h2>
              <p className="section__subtitle mb-8">
                Every feature we build is designed to give professionals leverage. Whether it's verified salary data, anonymous company reviews, or direct access to global employers.
              </p>
              <Link href="/jobs" className="btn btn--primary">Find your next role</Link>
            </div>
            <div className="grid grid-cols-2 gap-6 flex-1 min-w-layout-lg">
              <div className="bg-c800 p-8 rounded-xl border border-c700 text-center">
                <div className="text-4xl font-black text-blue mb-2">190k+</div>
                <div className="text-sm text-c400">Verified Professionals</div>
              </div>
              <div className="bg-c800 p-8 rounded-xl border border-c700 text-center">
                <div className="text-4xl font-black text-green mb-2">47k+</div>
                <div className="text-sm text-c400">Salary Reports</div>
              </div>
              <div className="bg-c800 p-8 rounded-xl border border-c700 text-center">
                <div className="text-4xl font-black text-goldH mb-2">12k+</div>
                <div className="text-sm text-c400">Company Reviews</div>
              </div>
              <div className="bg-c800 p-8 rounded-xl border border-c700 text-center">
                <div className="text-4xl font-black text-red mb-2">150+</div>
                <div className="text-sm text-c400">Countries Represented</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="container text-center">
          <h2 className="cta-banner__title">Ready to build your career?</h2>
          <p className="cta-banner__sub mx-auto">Join the fastest growing professional network today.</p>
          <div className="cta-banner__actions justify-center mt-8">
            <Link href="/auth/signup" className="btn btn--primary btn--lg">Create your profile</Link>
            <Link href="/employer/jobs/create" className="btn btn--ghost btn--lg">Post a job</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
