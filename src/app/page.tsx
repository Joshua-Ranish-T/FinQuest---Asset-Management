'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { 
  ArrowRight, PieChart, TrendingUp, Layers, 
  Sparkles, CheckCircle2, ChevronRight, ChevronLeft, Lock, Download, Smartphone
} from 'lucide-react';

const carouselSlides = [
  {
    title: 'Consolidated Net Worth',
    description: 'Track equities, mutual funds, EPF, gold, real estate and liabilities in one place.',
    badge: 'Portfolio Overview',
    content: {
      netWorth: '₹84,50,000',
      change: '+14.8% this year',
      assets: '₹1,12,50,000',
      liabilities: '₹28,00,000',
    },
  },
  {
    title: 'Income & Expense Analytics',
    description: 'Track monthly cash flows and watch your savings rate grow without connecting bank APIs.',
    badge: 'Cashflow Insights',
    content: {
      income: '₹1,85,000 / mo',
      expenses: '₹88,100 / mo',
      savingsRate: '52.4%',
      status: 'High Savings Rate',
    },
  },
  {
    title: 'Goals & Essentials Health Check',
    description: 'Monitor emergency funds, term life insurance coverage, and retirement readiness.',
    badge: 'Financial Health',
    content: {
      emergencyFund: '₹4.25L / ₹5.00L (85%)',
      termInsurance: '₹1.50 Cr (Active)',
      healthCover: '₹25L Family Floater (Active)',
    },
  },
  {
    title: 'Asset Allocation Breakdown',
    description: 'Visualize your portfolio across direct equities, fixed income, bullion, and real estate.',
    badge: 'Asset Allocation',
    content: {
      equities: '52% Equity & MF',
      epf: '14% EPF + PPF',
      gold: '8% Sovereign Gold',
      cash: '12% Bank & Cash',
    },
  },
];

const reviews = [
  { name: 'Aditya S.', handle: '@aditya_fin', text: 'FinQuest replaced 4 different spreadsheets. The manual entry and Zerodha CSV import takes 2 minutes.', stars: 5 },
  { name: 'Pooja K.', handle: '@poojatech', text: 'Finally a wealth tracker that does NOT ask for my bank netbanking passwords. Privacy first!', stars: 5 },
  { name: 'Nikhil V.', handle: '@nikhil_dev', text: 'The XIRR and SIP step-up calculators are fast, clean, and run completely offline in the browser.', stars: 5 },
  { name: 'Rahul M.', handle: '@rahul_invests', text: 'Consolidated net worth across USD tech stocks and Indian mutual funds works seamlessly.', stars: 5 },
  { name: 'Sneha R.', handle: '@sneha_wealth', text: 'Purchased Pro for lifetime access. Best money spent on personal finance software.', stars: 5 },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const prevSlide = () => {
    setCurrentSlide((curr) => (curr === 0 ? carouselSlides.length - 1 : curr - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((curr) => (curr === carouselSlides.length - 1 ? 0 : curr + 1));
  };

  return (
    <>
      <Header />

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section style={{ padding: '5rem 0 3.5rem 0', position: 'relative', overflow: 'hidden' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.825rem', fontWeight: 600, marginBottom: '1.75rem' }}>
              <Sparkles size={15} />
              <span>Private Wealth Management &bull; Zero Bank Logins</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.25rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
              All your money. <br />
              <span style={{ background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                In one place.
              </span>
            </h1>

            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
              Track 20+ asset classes, monitor consolidated net worth, analyze cashflow, and verify your financial health without handing over bank credentials.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginBottom: '3.5rem' }}>
              <Link href="/login?mode=register" className="btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem' }}>
                <span>Get Started Free</span>
                <ArrowRight size={18} />
              </Link>
              <Link href="/demo" className="btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem' }}>
                <span>Try the live demo</span>
              </Link>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--brand-primary)" />
                <span><strong>45+</strong> Currencies</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--brand-primary)" />
                <span><strong>20+</strong> Asset Classes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--brand-primary)" />
                <span><strong>Zero</strong> Bank Logins</span>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Carousel (Interactive Desktop) */}
        <section style={{ padding: '2rem 0 5rem 0' }}>
          <div className="container" style={{ maxWidth: '1000px' }}>
            <div className="glass-card" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className="badge badge-emerald">{carouselSlides[currentSlide].badge}</span>
                  <h3 style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>{carouselSlides[currentSlide].title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>{carouselSlides[currentSlide].description}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={prevSlide} className="btn-secondary" aria-label="Previous slide" style={{ padding: '0.5rem' }}>
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={nextSlide} className="btn-secondary" aria-label="Next slide" style={{ padding: '0.5rem' }}>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Dynamic Slide Cards */}
              <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', padding: '2rem', border: '1px solid var(--border-subtle)' }}>
                {currentSlide === 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>Consolidated Net Worth</div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{carouselSlides[0].content.netWorth}</div>
                      <div style={{ color: 'var(--brand-primary)', fontSize: '0.85rem' }}>{carouselSlides[0].content.change}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>Total Assets</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{carouselSlides[0].content.assets}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>Total Liabilities</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-danger)' }}>{carouselSlides[0].content.liabilities}</div>
                    </div>
                  </div>
                )}
                {currentSlide === 1 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>Monthly Income</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--brand-primary)' }}>{carouselSlides[1].content.income}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>Monthly Expenses</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-warning)' }}>{carouselSlides[1].content.expenses}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>Savings Rate</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{carouselSlides[1].content.savingsRate}</div>
                    </div>
                  </div>
                )}
                {currentSlide === 2 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>Emergency Fund</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{carouselSlides[2].content.emergencyFund}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>Term Life Insurance</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-primary)' }}>{carouselSlides[2].content.termInsurance}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>Health Insurance</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-primary)' }}>{carouselSlides[2].content.healthCover}</div>
                    </div>
                  </div>
                )}
                {currentSlide === 3 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ padding: '0.75rem', background: 'var(--bg-input)', borderRadius: '6px' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Direct Equity & MF</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-primary)' }}>52%</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'var(--bg-input)', borderRadius: '6px' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>EPF + PPF</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-info)' }}>14%</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'var(--bg-input)', borderRadius: '6px' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Gold (SGB)</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-gold)' }}>8%</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'var(--bg-input)', borderRadius: '6px' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Cash & Savings</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>12%</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dots Pagination */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                {carouselSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    style={{
                      width: currentSlide === idx ? '1.75rem' : '0.5rem',
                      height: '0.5rem',
                      borderRadius: 'var(--radius-full)',
                      background: currentSlide === idx ? 'var(--brand-primary)' : 'var(--border-medium)',
                      transition: 'all 200ms',
                    }}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Marquee Section */}
        <section id="reviews" style={{ padding: '4rem 0', overflow: 'hidden', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="container" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-gold">Community Verified</span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>Trusted by 10,000+ Investors</h2>
          </div>

          <div className="animate-marquee" style={{ gap: '1.5rem', padding: '0.5rem 0' }}>
            {[...reviews, ...reviews].map((rev, i) => (
              <div key={i} className="glass-card" style={{ width: '320px', flexShrink: 0, padding: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.75rem' }}>
                  {Array.from({ length: rev.stars }).map((_, s) => (
                    <span key={s} style={{ color: 'var(--brand-gold)' }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  &ldquo;{rev.text}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                    {rev.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{rev.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rev.handle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" style={{ padding: '5rem 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3.5rem auto' }}>
              <span className="badge badge-emerald">Simple & Private</span>
              <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem', marginBottom: '1rem' }}>How FinQuest Works</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Get a complete financial picture in less than 3 minutes without linking bank accounts.</p>
            </div>

            <div className="grid-cols-3">
              <div className="glass-card" style={{ textAlign: 'center' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', fontWeight: 800 }}>
                  1
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Sign Up or Try Demo</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Use Google or Email. No credit card required. Demo mode available instantly without an account.</p>
              </div>

              <div className="glass-card" style={{ textAlign: 'center' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', fontWeight: 800 }}>
                  2
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Add Assets or Upload CSV</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Add assets across 20+ classes, or upload your Zerodha/Groww statement directly from your browser.</p>
              </div>

              <div className="glass-card" style={{ textAlign: 'center' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', fontWeight: 800 }}>
                  3
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>See Consolidated Wealth</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Review net worth trajectories, asset allocation donut charts, and automated financial health checks.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" style={{ padding: '5rem 0', background: 'var(--bg-surface)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
              <span className="badge badge-emerald">Comprehensive Capabilities</span>
              <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem', marginBottom: '1rem' }}>Built for the Serious Investor</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Every feature is designed with privacy, accuracy, and speed in mind.</p>
            </div>

            <div className="grid-cols-3">
              <div className="glass-card">
                <Layers size={28} color="var(--brand-primary)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>20+ Asset Classes</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Stocks, MFs, EPF, PPF, NPS, SGB, Real Estate, Crypto, RSUs, and cash in all your accounts.</p>
              </div>

              <div className="glass-card">
                <Download size={28} color="var(--brand-primary)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Import from Zerodha & Groww</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Import stock and mutual fund holdings directly using browser-parsed CSV files without sharing API keys.</p>
              </div>

              <div className="glass-card">
                <TrendingUp size={28} color="var(--brand-primary)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Net Worth Snapshots</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Capture point-in-time portfolio values and visualize your trajectory across months and years.</p>
              </div>

              <div className="glass-card">
                <PieChart size={28} color="var(--brand-primary)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Cashflow & Savings Rate</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Track income and expenses, group by category, and evaluate your monthly net savings percentage.</p>
              </div>

              <div className="glass-card">
                <Lock size={28} color="var(--brand-primary)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Zero Bank Credentials</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>We never ask for account numbers, bank passwords, or OTPs. Your money remains private.</p>
              </div>

              <div className="glass-card">
                <Smartphone size={28} color="var(--brand-primary)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Installable PWA</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Install FinQuest on iOS and Android with offline-first client calculators and rapid caching.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" style={{ padding: '5rem 0' }}>
          <div className="container" style={{ maxWidth: '960px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <span className="badge badge-gold">Transparent Pricing</span>
              <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem', marginBottom: '1rem' }}>Simple, Honest Plans</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Get started for free forever, or upgrade to Pro for unlimited power.</p>
            </div>

            <div className="grid-cols-2" style={{ alignItems: 'stretch' }}>
              {/* Free Plan */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.35rem' }}>Free Plan</h3>
                    <span className="badge badge-muted">Forever</span>
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>₹0</div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="var(--brand-primary)" />
                      <span>Track up to <strong>25 assets</strong></span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="var(--brand-primary)" />
                      <span>Track up to <strong>5 liabilities</strong></span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="var(--brand-primary)" />
                      <span>Track up to <strong>3 financial goals</strong></span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="var(--brand-primary)" />
                      <span><strong>2 snapshots</strong> per calendar month</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="var(--brand-primary)" />
                      <span>All 6 client-side financial calculators</span>
                    </li>
                  </ul>
                </div>
                <Link href="/login?mode=register" className="btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                  Get Started Free
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--brand-primary)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-0.75rem', right: '1.5rem' }}>
                  <span className="badge badge-emerald">Most Popular</span>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.35rem' }}>Pro Plan</h3>
                    <span className="badge badge-gold">Lifetime Access</span>
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>₹2,999</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--brand-primary)', marginBottom: '1.5rem' }}>One-time payment &bull; No recurring subscriptions</div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="var(--brand-primary)" />
                      <span><strong>Unlimited assets & liabilities</strong></span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="var(--brand-primary)" />
                      <span><strong>Unlimited snapshots & goals</strong></span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="var(--brand-primary)" />
                      <span><strong>Family Profiles</strong></span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="var(--brand-primary)" />
                      <span>Full CSV & JSON data export anytime</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="var(--brand-primary)" />
                      <span>14-day money back guarantee</span>
                    </li>
                  </ul>
                </div>
                <Link href="/login?mode=register" className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" style={{ padding: '5rem 0', background: 'var(--bg-surface)' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="badge badge-muted">Got Questions?</span>
              <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem' }}>Frequently Asked Questions</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <details className="glass-card" style={{ cursor: 'pointer', padding: '1.25rem' }}>
                <summary style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)', outline: 'none' }}>
                  Do I need to connect my bank accounts?
                </summary>
                <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                  No. FinQuest is strictly privacy-first. You never provide netbanking credentials or OTPs. You can add assets manually in seconds or upload holdings statements exported from Zerodha or Groww.
                </p>
              </details>

              <details className="glass-card" style={{ cursor: 'pointer', padding: '1.25rem' }}>
                <summary style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)', outline: 'none' }}>
                  Is the Free tier really free forever?
                </summary>
                <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                  Yes. The Free plan includes up to 25 assets, 5 liabilities, 3 goals, and 2 net worth snapshots each month forever without requiring payment info.
                </p>
              </details>

              <details className="glass-card" style={{ cursor: 'pointer', padding: '1.25rem' }}>
                <summary style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)', outline: 'none' }}>
                  Can I track international assets and multi-currency?
                </summary>
                <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                  Yes. FinQuest supports over 45 currencies including USD, EUR, GBP, AED, SGD, and CAD, and automatically converts values into your chosen consolidated base currency.
                </p>
              </details>

              <details className="glass-card" style={{ cursor: 'pointer', padding: '1.25rem' }}>
                <summary style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)', outline: 'none' }}>
                  How can I export or delete my data?
                </summary>
                <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                  You retain complete ownership. You can download all your data in JSON or CSV format anytime from Settings. You can also permanently wipe your account with a single click.
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
