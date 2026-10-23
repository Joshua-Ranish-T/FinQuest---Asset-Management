import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, Lock, EyeOff, Server, Database } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main style={{ padding: '4rem 0 6rem 0', flex: 1 }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <div style={{ marginBottom: '3rem' }}>
            <span className="badge badge-emerald" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
              Privacy First by Design
            </span>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Privacy Policy</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Last updated: October 2026. FinQuest is built on the unwavering belief that your financial life belongs only to you.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: 1.7, fontSize: '0.95rem' }}>
            <section>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <EyeOff size={20} color="var(--brand-primary)" />
                <span>1. Zero Bank Credentials & Zero Account Aggregator Scraping</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Unlike conventional fintech apps, FinQuest <strong>never asks for your bank net-banking passwords, UPI PINs, or broker API credentials</strong>. You never connect bank accounts or broker access tokens. We operate strictly via manual entry and local client-side CSV parsing.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Server size={20} color="#38bdf8" />
                <span>2. Client-Side Statement Processing</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                When you import broker statements from Zerodha or Groww, all CSV parsing and symbol mapping occurs <strong>100% locally in your client web browser</strong>. Your raw statement documents are never uploaded or stored in unencrypted form on intermediate servers.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={20} color="#f59e0b" />
                <span>3. Data Storage & PostgreSQL Security</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                All user accounts and portfolio values are housed in dedicated PostgreSQL databases on secure AWS cloud infrastructure. Every database query enforces strict <strong>Row Level Security (RLS)</strong>, guaranteeing that users can only ever query records belonging strictly to their authenticated JWT session.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={20} color="#ec4899" />
                <span>4. Absolute Data Ownership & Total Erasure</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                You have the complete right to export all your data at any time via single-click JSON or CSV download. Furthermore, our <strong>Danger Zone</strong> feature empowers you to permanently wipe all stored portfolio data instantly. Deletion is irreversible and completely removes all database rows.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
