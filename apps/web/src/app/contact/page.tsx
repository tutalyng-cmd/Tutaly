import Link from "next/link";

export const metadata = {
  title: "Contact Us - Tutaly",
  description: "Get in touch with the Tutaly team for support, sales, or general inquiries.",
};

export default function ContactPage() {
  return (
    <main>
      <section className="hero">
        <div className="container relative text-center">
          <div className="hero__eyebrow justify-center">
            <div className="hero__eyebrow-line" aria-hidden="true"></div>
            <span>Contact Us</span>
          </div>
          <h1 className="hero__title mx-auto max-w-layout-lg">How can we help?</h1>
          <p className="hero__subtitle mx-auto">
            Whether you are a job seeker looking for support or an employer interested in our enterprise plans, we're here for you.
          </p>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container max-w-layout-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-c800 border border-c700 rounded-xl p-8 text-center hover:border-c600 transition-colors">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-c100 mb-2">Support</h3>
              <p className="text-c400 text-sm mb-6">Need help with your account, a salary report, or a job application?</p>
              <Link href="mailto:support@tutaly.com" className="btn btn--primary w-full justify-center">support@tutaly.com</Link>
            </div>

            <div className="bg-c800 border border-c700 rounded-xl p-8 text-center hover:border-c600 transition-colors">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-c100 mb-2">Sales</h3>
              <p className="text-c400 text-sm mb-6">Interested in enterprise hiring, volume posting, or API access?</p>
              <Link href="mailto:sales@tutaly.com" className="btn btn--primary w-full justify-center">sales@tutaly.com</Link>
            </div>
          </div>

          <div className="bg-c800 border border-c700 rounded-xl p-8">
            <h3 className="text-xl font-bold text-c100 mb-6">Send us a message</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-c200 mb-2">Name</label>
                  <input type="text" id="name" className="w-full bg-c900 border border-c700 rounded-md px-4 py-3 text-c100 focus:outline-none focus:border-blue transition-colors" placeholder="Jane Doe" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-c200 mb-2">Email</label>
                  <input type="email" id="email" className="w-full bg-c900 border border-c700 rounded-md px-4 py-3 text-c100 focus:outline-none focus:border-blue transition-colors" placeholder="jane@example.com" />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-bold text-c200 mb-2">Subject</label>
                <input type="text" id="subject" className="w-full bg-c900 border border-c700 rounded-md px-4 py-3 text-c100 focus:outline-none focus:border-blue transition-colors" placeholder="How can we help?" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-bold text-c200 mb-2">Message</label>
                <textarea id="message" rows={5} className="w-full bg-c900 border border-c700 rounded-md px-4 py-3 text-c100 focus:outline-none focus:border-blue transition-colors resize-y" placeholder="Your message here..."></textarea>
              </div>
              <button type="button" className="btn btn--primary w-full justify-center mt-2">Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
