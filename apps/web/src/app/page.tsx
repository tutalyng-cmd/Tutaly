import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import HeroSearch from '@/components/home/HeroSearch';
import Reveal from '@/components/motion/Reveal';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';
import AnimatedNumber from '@/components/motion/AnimatedNumber';
import { serverFetch } from '@/lib/server-fetch';
import AdBanner from '@/components/layout/AdBanner';
interface Job {
  id: string;
  title: string;
  jobType: string;
  workMode: string;
  country: string;
  state: string;
  area?: string;
  minSalary?: number;
  maxSalary?: number;
  currency: string;
  employer?: { email: string };
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

async function fetchFeaturedJobs(): Promise<Job[]> {
  try {
    const data = await serverFetch<any>('jobs?isFeatured=true&limit=6', {
      next: { revalidate: 300 }
    });
    return data?.items || [];
  } catch (error) {
    console.error('Failed to fetch featured jobs:', error);
    return [];
  }
}

async function fetchRecentReviews() {
  try {
    const data = await serverFetch<any>('reviews/companies/all/recent?limit=3', {
      next: { revalidate: 300 }
    });
    return data?.data || [];
  } catch (error) {
    return [];
  }
}

async function fetchFeaturedProducts() {
  try {
    const data = await serverFetch<any>('shop/products?limit=4', {
      next: { revalidate: 300 }
    });
    return data?.items || data?.data || [];
  } catch (error) {
    return [];
  }
}

async function fetchStats() {
  try {
    const res = await serverFetch<any>('stats/platform', {
      next: { revalidate: 300 }
    });
    return res?.data || {
      activeJobs: 48000,
      companiesReviewed: 12000,
      countriesRepresented: 35,
      professionals: 190000
    };
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return {
      activeJobs: 48000,
      companiesReviewed: 12000,
      countriesRepresented: 35,
      professionals: 190000
    };
  }
}

export default async function Home() {
  const [featuredJobs, stats, reviews, products] = await Promise.all([
    fetchFeaturedJobs(),
    fetchStats(),
    fetchRecentReviews(),
    fetchFeaturedProducts()
  ]);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="hero" aria-label="Hero section">
        <div className="container relative">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="hero__eyebrow">
                <div className="hero__eyebrow-line" aria-hidden="true"></div>
                <span className="hero__eyebrow-text">Built from Lagos. Built for the world.</span>
              </div>

              <h1 className="hero__headline">
                Your career.<br />
                Your worth.<br />
                <em>Your platform.</em>
              </h1>

              <p className="hero__sub">
                Find top jobs, see what companies actually pay, and build the career you deserve — wherever you are. One platform for professionals everywhere.
              </p>

              {/* Search */}
              <HeroSearch />

              <div className="hero__trending" aria-label="Trending job searches">
                <strong>Trending:</strong>
                <Link href="/jobs?keyword=Product" className="hero__trending-tag">Product Manager</Link>
                <Link href="/jobs?keyword=Software" className="hero__trending-tag">Software Engineer</Link>
                <Link href="/jobs?keyword=Data" className="hero__trending-tag">Data Analyst</Link>
                <Link href="/jobs?keyword=Remote" className="hero__trending-tag">Remote</Link>
              </div>

              {/* Stats */}
              <div className="hero__proof" role="list" aria-label="Platform statistics">
                <div className="hero__proof-item" role="listitem">
                  <span className="hero__proof-num"><AnimatedNumber value={stats.activeJobs} />+</span>
                  <span className="hero__proof-label">Active jobs</span>
                </div>
                <div className="hero__proof-divider" aria-hidden="true"></div>
                <div className="hero__proof-item" role="listitem">
                  <span className="hero__proof-num"><AnimatedNumber value={stats.companiesReviewed} />+</span>
                  <span className="hero__proof-label">Companies reviewed</span>
                </div>
                <div className="hero__proof-divider" aria-hidden="true"></div>
                <div className="hero__proof-item" role="listitem">
                  <span className="hero__proof-num"><AnimatedNumber value={stats.countriesRepresented} />+</span>
                  <span className="hero__proof-label">Countries represented</span>
                </div>
                <div className="hero__proof-divider" aria-hidden="true"></div>
                <div className="hero__proof-item" role="listitem">
                  <span className="hero__proof-num"><AnimatedNumber value={stats.professionals} />+</span>
                  <span className="hero__proof-label">Professionals</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="hidden lg:block relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue/20 to-transparent z-10 mix-blend-overlay"></div>
              <Image src="/images/hero.png" alt="Professionals collaborating" width={800} height={800} className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700" priority />
            </div>
          </div>

        </div>
      </section>

      {/* ── ADVERTISEMENT ──────────────────────────────────────────── */}
      <AdBanner placement="homepage_top" />

      {/* ── LOGOS ──────────────────────────────────────────────────── */}


      {/* ── FOR PROFESSIONALS ─────────────────────────────────────── */}
      <section className="section" id="jobs" aria-labelledby="features-title">
        <Reveal className="container">
          <div className="reveal visible">
            <div className="section__label">For professionals</div>
            <h2 className="section__title" id="features-title">Everything your career needs.<br />One platform.</h2>
            <p className="section__subtitle">Stop switching between five different apps. Tutaly is the job board, salary database, review site, and professional network in one.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-12">
            <StaggerContainer className="space-y-6">
              <StaggerItem className="feat bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-c100 hover:shadow-md transition-shadow premium-hover">
                <div className="feat__icon feat__icon--blue" aria-hidden="true">💼</div>
                <h3 className="feat__title">Find the right job</h3>
                <p className="feat__body">Thousands of roles across major hubs and remote-first companies worldwide. Filter by salary, company size, industry, and experience level.</p>
                <Link href="/jobs" className="feat__link">Browse jobs &rarr;</Link>
              </StaggerItem>
              <StaggerItem className="feat bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-c100 hover:shadow-md transition-shadow">
                <div className="feat__icon feat__icon--green" aria-hidden="true">₦</div>
                <h3 className="feat__title">Know what you're worth</h3>
                <p className="feat__body">Real salary data from verified professionals. See what your role pays at every company before you walk into a negotiation.</p>
                <Link href="/salaries" className="feat__link">Check your salary &rarr;</Link>
              </StaggerItem>

              <StaggerItem className="feat bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-c100 hover:shadow-md transition-shadow premium-hover">
                <div className="feat__icon feat__icon--teal" aria-hidden="true">⭐</div>
                <h3 className="feat__title">Read honest reviews</h3>
                <p className="feat__body">Anonymous reviews from people who've worked there. Culture, management, growth — the real picture, not the PR one.</p>
                <Link href="/reviews" className="feat__link">Read reviews &rarr;</Link>
              </StaggerItem>
            </StaggerContainer>

            <div className="hidden lg:block relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-white/20 h-full premium-hover" style={{ minHeight: '500px' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 mix-blend-overlay"></div>
              <Image src="/images/feature.png" alt="Professional working" layout="fill" objectFit="cover" className="transform hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── SALARY INTELLIGENCE ────────────────────────────────────── */}
      <section className="section section--alt" id="salaries" aria-labelledby="salary-title">
        <div className="container">
          <div className="salary-split">
            <div className="reveal visible">
              <div className="section__label">Salary intelligence</div>
              <h2 className="section__title" id="salary-title">Stop guessing.<br />Start knowing.</h2>
              <p className="section__subtitle mb-8">Most professionals walk into a negotiation with no idea what they're actually worth. Tutaly shows you real pay data, in your currency, before you walk in.</p>
              <Link href="/salaries" className="btn btn--primary btn--lg">Check your salary now</Link>
              <p className="mt-3.5 text-sm text-c500">No sign-up needed. Data from 47,000+ salary reports.</p>
            </div>
            <div className="reveal visible">
              <div className="salary-card">
                <div className="salary-card__header">
                  <div>
                    <div className="salary-card__role">Product Manager</div>
                    <div className="salary-card__loc">📍 Lagos, Nigeria &middot; 3–6 years experience</div>
                  </div>
                  <div>
                    <div className="salary-card__avg">₦820K</div>
                    <div className="salary-card__avg-label">median / month</div>
                  </div>
                </div>
                <div className="salary-bar-wrap">
                  <div className="salary-bar-labels">
                    <span>₦450K</span>
                    <span>Median</span>
                    <span>₦1.4M</span>
                  </div>
                  <div className="salary-bar-track">
                    <div className="salary-bar-fill w-3/5">
                      <div className="salary-bar-marker"></div>
                    </div>
                  </div>
                </div>
                <div className="salary-roles" aria-label="Salary ranges by role">
                  <div className="salary-role-row">
                    <div>
                      <div className="salary-role-name">Software Engineer</div>
                    </div>
                    <div className="salary-role-range">₦600K–₦1.3M</div>
                  </div>
                  <div className="salary-role-row">
                    <div>
                      <div className="salary-role-name">Data Analyst</div>
                    </div>
                    <div className="salary-role-range">₦350K–₦750K</div>
                  </div>
                  <div className="salary-role-row">
                    <div>
                      <div className="salary-role-name">UX Designer</div>
                    </div>
                    <div className="salary-role-range">₦400K–₦900K</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {featuredJobs.length > 0 && (
        <section className="section pb-4">
          <Reveal className="container">
            <h2 className="section__title mb-8" style={{ fontSize: '24px' }}>Featured Opportunities</h2>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.slice(0, 6).map((job) => (
                <StaggerItem key={job.id} className="premium-hover">
                  <Link href={`/jobs?jobId=${job.id}`} className="feat bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-c100 hover:shadow-md transition-shadow h-full block">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="feat__title mb-0">{job.title}</h3>
                      {job.employer?.email && (
                        <div className="w-8 h-8 rounded-full bg-blue-10 flex items-center justify-center text-blue text-xs font-bold">
                          {job.employer.email.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-c400 mb-4">{job.jobType} &middot; {job.workMode} &middot; {job.country}</div>
                    <div className="font-mono text-c100 font-bold">
                      {job.minSalary && job.maxSalary
                        ? `${CURRENCY_SYMBOLS[job.currency] || job.currency}${(job.minSalary / 1000).toFixed(0)}K - ${(job.maxSalary / 1000).toFixed(0)}K`
                        : 'Salary negotiable'}
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
            <div className="mt-8 text-center">
              <Link href="/jobs" className="btn btn--ghost">View all jobs</Link>
            </div>
          </Reveal>
        </section>
      )}

      {/* ── REVIEWS ────────────────────────────────────────────────── */}
      <section className="section" id="reviews" aria-labelledby="reviews-title">
        <Reveal className="container">
          <div className="reveal visible text-center max-w-layout-md mx-auto mb-14">
            <div className="section__label justify-center">Company reviews</div>
            <h2 className="section__title" id="reviews-title">The honest version of the job description.</h2>
            <p className="text-base text-c300 leading-relaxed">Before you say yes to an offer, hear from people who already said yes — and what happened after.</p>
          </div>
          <StaggerContainer className="reviews-row reveal visible">
            {reviews.map((review: any, idx: number) => {
              const COLORS = [
                { background: 'var(--green-10)', color: 'var(--green)' },
                { background: 'var(--blue-10)', color: 'var(--blue-l)' },
                { background: 'var(--gold-10)', color: 'var(--gold)' }
              ];
              const style = COLORS[idx % COLORS.length];
              const initials = review.companyName ? review.companyName.charAt(0).toUpperCase() : 'C';

              return (
                <StaggerItem key={review.id} className="premium-hover h-full">
                  <article className="review-card h-full">
                    <div className="review-card__header">
                      <div className="review-card__logo" style={{ backgroundColor: style.background, color: style.color }}>{initials}</div>
                      <div>
                        <div className="review-card__company">{review.companyName}</div>
                        <div className="review-card__stars" aria-label={`Rating: ${review.ratingOverall} out of 5`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < Number(review.ratingOverall) ? 'star' : 'star star--empty'}>★</span>
                          ))}
                          <span className="review-card__score">{review.ratingOverall}</span>
                        </div>
                      </div>
                    </div>
                    <div className="review-card__title">"{review.title}"</div>
                    <p className="review-card__quote line-clamp-4">{review.pros || review.cons || "An honest review from an employee."}</p>
                    <div className="review-card__meta">
                      <span className="review-card__role">{review.department} &middot; {review.location}</span>
                      <span className={`review-card__rec ${review.recommend ? 'review-card__rec--yes' : 'text-c400'}`}>
                        {review.recommend ? 'Recommends' : 'No recommend'}
                      </span>
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
          <div className="text-center reveal visible mt-8">
            <Link href="/reviews" className="btn btn--ghost btn--lg">Read 12,000+ company reviews</Link>
          </div>
        </Reveal>
      </section>

      {/* ── SHOP ─────────────────────────────────────────────── */}
      <section className="section section--alt" id="shop" aria-labelledby="market-title">
        <div className="container">
          <div className="reveal visible flex items-end justify-between mb-12 flex-wrap gap-5">
            <div>
              <div className="section__label">Shop</div>
              <h2 className="section__title mb-0" id="market-title">Career resources built for you.</h2>
            </div>
            <Link href="/shop" className="btn btn--ghost">Browse all resources</Link>
          </div>
          <div className="market-grid reveal visible">
            {products.map((product: any, idx: number) => {
              const icons = ['📄', '📊', '🎓', '💼'];
              const icon = icons[idx % icons.length];
              const priceFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency || 'USD', minimumFractionDigits: 0 }).format(product.price || 0);

              return (
                <article key={product.id} className="market-card">
                  <Link href={`/shop/${product.id}`} className="absolute inset-0 z-10" aria-label={`View ${product.title}`}></Link>
                  <div className="market-card__thumb" style={{ backgroundColor: 'var(--c-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                    {icon}
                    {idx === 0 && <span className="market-card__badge tag--blue z-20">Bestseller</span>}
                  </div>
                  <div className="market-card__body">
                    <div className="market-card__title">{product.title}</div>
                    <div className="market-card__seller">by {product.seller?.profile?.companyName || product.seller?.firstName || 'Creator'}</div>
                    <div className="market-card__footer">
                      <span className="market-card__price">{priceFormatted}</span>
                      <span className="market-card__rating">★ 4.9 ({product.reviewCount || '1204'})</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FOR EMPLOYERS ────────────────────────────────────────────── */}
      <section className="section" aria-labelledby="employer-title">
        <div className="container">
          <div className="employer-split">
            <div className="reveal visible">
              <div className="section__label">For employers</div>
              <h2 className="section__title" id="employer-title">Find talent without borders.</h2>
              <p className="section__subtitle mb-10">190,000+ verified professionals across every major market. Post a job in under 5 minutes. Manage every application from one dashboard.</p>
              <div className="employer-list">
                <div className="employer-item">
                  <div className="employer-item__icon" aria-hidden="true">📋</div>
                  <div>
                    <div className="employer-item__title">Post jobs in 5 minutes</div>
                    <div className="employer-item__body">No sales call, no lengthy setup. Post your listing, set your criteria, and receive applications by the hour.</div>
                  </div>
                </div>
                <div className="employer-item">
                  <div className="employer-item__icon" aria-hidden="true">🎯</div>
                  <div>
                    <div className="employer-item__title">Reach the right candidates</div>
                    <div className="employer-item__body">Your listing reaches active job seekers matched to your role's requirements — not just anyone browsing the feed.</div>
                  </div>
                </div>
                <div className="employer-item">
                  <div className="employer-item__icon" aria-hidden="true">📣</div>
                  <div>
                    <div className="employer-item__title">Run targeted ad campaigns</div>
                    <div className="employer-item__body">Promote your employer brand to a professional audience with campaign tools built like Facebook Ads, without the complexity.</div>
                  </div>
                </div>
              </div>
              <Link href="/employer/jobs/create" className="btn btn--primary btn--lg mt-8">Post a job — starts at ₦25,000</Link>
            </div>
            <div className="reveal visible">
              <div className="dashboard-preview" role="img" aria-label="Employer dashboard preview">
                <div className="dashboard-topbar">
                  <div className="dot dot--red"></div>
                  <div className="dot dot--amber"></div>
                  <div className="dot dot--green"></div>
                  <span className="ml-2.5 text-xs text-c500">Employer Dashboard</span>
                </div>
                <div className="dashboard-body">
                  <div className="dashboard-stats">
                    <div className="db-stat">
                      <div className="db-stat__num">147</div>
                      <div className="db-stat__label">Applicants</div>
                    </div>
                    <div className="db-stat">
                      <div className="db-stat__num">23</div>
                      <div className="db-stat__label">Shortlisted</div>
                    </div>
                    <div className="db-stat">
                      <div className="db-stat__num">6</div>
                      <div className="db-stat__label">Interviews</div>
                    </div>
                  </div>
                  <div className="db-candidates" aria-label="Candidate pipeline">
                    <div className="db-candidate">
                      <div>
                        <div className="db-candidate__name">Amara Okonkwo</div>
                        <div className="db-candidate__role">Senior Engineer &middot; 5 yrs &middot; Lagos</div>
                      </div>
                      <span className="db-candidate__status status--interview">Interview</span>
                    </div>
                    <div className="db-candidate">
                      <div>
                        <div className="db-candidate__name">Daniel Kim</div>
                        <div className="db-candidate__role">Product Manager &middot; 4 yrs &middot; Toronto</div>
                      </div>
                      <span className="db-candidate__status status--offer">Offer sent</span>
                    </div>
                    <div className="db-candidate">
                      <div>
                        <div className="db-candidate__name">Priya Nair</div>
                        <div className="db-candidate__role">Data Scientist &middot; 3 yrs &middot; Remote</div>
                      </div>
                      <span className="db-candidate__status status--review">In review</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
      <section className="testimonials" aria-labelledby="testi-title">
        <div className="container">
          <div className="reveal visible text-center mb-14">
            <div className="section__label justify-center">Real outcomes</div>
            <h2 className="section__title" id="testi-title">What changes when you know your worth.</h2>
          </div>
          <div className="testimonials-grid reveal visible">
            <blockquote className="testi">
              <p className="testi__quote">I used Tutaly's salary data to negotiate my offer at Paystack. I went in knowing the market range. Walked out ₦200K above their opening offer.</p>
              <div className="testi__author">
                <div className="testi__avatar overflow-hidden">
                  <Image src="/images/avatar_1.png" alt="Kemi Adeyemi" width={48} height={48} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="testi__name">Kemi Adeyemi</div>
                  <div className="testi__title">Product Manager, Lagos</div>
                  <div className="testi__raise">↑ ₦200K negotiated</div>
                </div>
              </div>
            </blockquote>
            <blockquote className="testi">
              <p className="testi__quote">The company reviews saved me from accepting an offer at a place that looked good on paper. Three ex-employees said the same thing about the culture. I passed.</p>
              <div className="testi__author">
                <div className="testi__avatar overflow-hidden">
                  <Image src="/images/avatar_2.png" alt="Ifeanyi Okafor" width={48} height={48} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="testi__name">Ifeanyi Okafor</div>
                  <div className="testi__title">Software Engineer, Abuja</div>
                  <div className="testi__raise text-blueL">→ Avoided a bad move</div>
                </div>
              </div>
            </blockquote>
            <blockquote className="testi">
              <p className="testi__quote">Found my current role, bought a salary report, and connected with my mentor all on Tutaly. It's actually one platform, not five duct-taped together.</p>
              <div className="testi__author">
                <div className="testi__avatar overflow-hidden">
                  <Image src="/images/avatar_3.png" alt="Sofia Martins" width={48} height={48} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="testi__name">Sofia Martins</div>
                  <div className="testi__title">Data Analyst, São Paulo</div>
                  <div className="testi__raise text-goldH">★ New role in 6 weeks</div>
                </div>
              </div>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="cta-banner" aria-labelledby="cta-title">
        <div className="container">
          <div className="reveal visible">
            <div className="section__label justify-center mb-5">Start today</div>
            <h2 className="cta-banner__title" id="cta-title">Your next move starts here.</h2>
            <p className="cta-banner__sub">Join 190,000+ professionals who use Tutaly to find better jobs, earn what they're worth, and build careers that last.</p>
            <div className="cta-banner__actions">
              <Link href="/auth/signup" className="btn btn--primary btn--lg">Create free account</Link>
              <Link href="/employer/jobs/create" className="btn btn--ghost btn--lg">Post a job</Link>
            </div>
            <p className="cta-banner__note">Free to join. No credit card required.</p>
          </div>
        </div>
      </section>
    </>
  );
}
