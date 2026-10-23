import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', padding: '4rem 0 2rem 0', marginTop: 'auto' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.75rem' }}>
              Fin<span style={{ color: 'var(--brand-primary)' }}>Quest</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, maxWidth: '280px' }}>
              Private wealth management for modern Indian investors. Zero bank connections, total privacy.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Free Calculators
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <Link href="/calculators/xirr">XIRR Calculator</Link>
              <Link href="/calculators/sip">SIP Calculator</Link>
              <Link href="/calculators/lumpsum">Lumpsum Calculator</Link>
              <Link href="/calculators/cagr">CAGR Calculator</Link>
              <Link href="/calculators/emi">EMI Calculator</Link>
              <Link href="/calculators/fd">FD Calculator</Link>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Product & Demo
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <Link href="/demo">Live Interactive Demo</Link>
              <Link href="/#pricing">Pricing Plans</Link>
              <Link href="/whats-new">What&apos;s New</Link>
              <Link href="/login">User Sign In</Link>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Privacy & Legal
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/refund-policy">Refund Policy</Link>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <div>
            &copy; 2026 FinQuest. Made in India.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} color="var(--brand-primary)" />
            <span>Privacy-First &bull; Zero Bank Passwords Required</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
