import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RefreshCw, HelpCircle, Mail } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <>
      <Header />
      <main style={{ padding: '4rem 0 6rem 0', flex: 1 }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <div style={{ marginBottom: '3rem' }}>
            <span className="badge badge-amber" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
              Customer Assurance
            </span>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Refund Policy</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Effective Date: October 2026. We stand behind FinQuest with complete transparency.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: 1.7, fontSize: '0.95rem' }}>
            <section>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={20} color="var(--brand-primary)" />
                <span>14-Day Money-Back Guarantee</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                We want you to be 100% delighted with FinQuest Pro. If for any reason within <strong>14 days of your Pro upgrade purchase</strong> you feel FinQuest does not fit your tracking workflow, simply contact our support team and we will issue a full 100% refund without hassle.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={20} color="#38bdf8" />
                <span>How to Request a Refund</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Send an email from your registered account email to <strong>support@finquest.app</strong> with your order receipt ID. Refunds are typically processed within 3-5 business days back to the original payment source (UPI, Card, or NetBanking).
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
