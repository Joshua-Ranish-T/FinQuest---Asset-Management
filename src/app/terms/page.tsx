import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FileText, ShieldAlert, Award } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main style={{ padding: '4rem 0 6rem 0', flex: 1 }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <div style={{ marginBottom: '3rem' }}>
            <span className="badge badge-cyan" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
              Legal Agreement
            </span>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Terms of Service</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Last revised: October 2026. Please read these terms carefully before accessing FinQuest.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: 1.7, fontSize: '0.95rem' }}>
            <section>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.75rem' }}>1. Informational & Educational Platform</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                FinQuest provides analytical tools and manual tracking calculators for personal wealth organization. FinQuest is <strong>not a SEBI-registered investment advisor</strong>, broker-dealer, portfolio manager, or tax consultancy. None of the calculators, dashboards, or insights constitute personalized investment, legal, or financial advice.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.75rem' }}>2. User Responsibilities & Data Accuracy</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                You are responsible for the correctness of the numbers, transaction dates, and values you enter into FinQuest. Because FinQuest does not scrape financial institutions or execute trades, portfolio valuations are direct functions of your logged holdings.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.75rem' }}>3. Pro Plan Lifetime License</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                The FinQuest Pro tier is granted as a single one-time payment for lifetime platform access for individual personal use. Account credentials may not be shared, resold, or redistributed.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
