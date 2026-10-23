import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Sparkles, Check, Zap, Layers, Calculator } from 'lucide-react';

export default function WhatsNewPage() {
  const releases = [
    {
      version: 'v2.4.0',
      date: 'October 2026',
      title: 'Full Net Worth Tracking Engine & Statement Import',
      badge: 'Latest',
      highlights: [
        'Added Zerodha & Groww client-side holdings CSV parser with automatic symbol and current value mapping.',
        'Expanded asset tracking to 20+ specialized asset classes (SGBs, EPF, PPF, Real Estate, Crypto, RSUs).',
        'Implemented 6 pure client-side mathematical calculators (XIRR Newton-Raphson, SIP Step-Up, Lumpsum, CAGR, EMI, FD).',
        'Introduced Net Worth Snapshots with monthly milestone tracking and historical growth metrics.',
        'Added Financial Safety & Essentials scorecard analyzing 6-month emergency runway, term life cover, and health insurance.',
      ],
    },
    {
      version: 'v2.2.0',
      date: 'September 2026',
      title: 'Cashflow Insights & Savings Rate Efficiency',
      highlights: [
        'Added monthly income & expense ledger with category tagging.',
        'Interactive Savings Rate efficiency meter and 50/30/20 budget analysis.',
        'Support for 45+ global currencies and dynamic base currency conversion.',
      ],
    },
    {
      version: 'v2.0.0',
      date: 'August 2026',
      title: 'Design System 2.0 & Dark Mode Architecture',
      highlights: [
        'Glassmorphism UI redesign with fluid typography and dynamic font-scaling.',
        'Instant Dark/Light theme switching with zero page flash.',
        'Full JSON & CSV data export and instant permanent account deletion (Danger Zone).',
      ],
    },
  ];

  return (
    <>
      <Header />
      <main style={{ padding: '4rem 0 6rem 0', flex: 1 }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <div style={{ marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Sparkles size={20} />
              </div>
              <h1 style={{ fontSize: '2.5rem' }}>What&apos;s New in FinQuest</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Changelog and feature updates crafted to make private wealth management effortless.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {releases.map((rel) => (
              <div key={rel.version} className="glass-card" style={{ padding: '2rem 2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{rel.version}</span>
                    {rel.badge && <span className="badge badge-emerald">{rel.badge}</span>}
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{rel.date}</span>
                </div>

                <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{rel.title}</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {rel.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <Check size={16} color="var(--brand-primary)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
