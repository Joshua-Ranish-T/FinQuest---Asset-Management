'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { api } from '@/lib/api-client';
import { 
  Check, X as Cross, Sparkles, Shield, ArrowRight, 
  CreditCard, Smartphone, Building, Zap, Lock 
} from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [processing, setProcessing] = useState(false);

  const handleUpgradeToPro = async () => {
    setProcessing(true);
    try {
      await api.post('/billing/upgrade', {});
      toast.success('Payment verified! Upgraded to FinQuest Pro Lifetime.');
      setShowCheckoutModal(false);
      router.push('/dashboard');
    } catch {
      toast.error('Payment checkout failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Header />
      <main style={{ padding: '4rem 0 6rem 0', flex: 1 }}>
        <div className="container">
          {/* Header Bar */}
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
            <span className="badge badge-emerald" style={{ marginBottom: '1rem', display: 'inline-block' }}>
              Transparent, Privacy-First Pricing
            </span>
            <h1 style={{ fontSize: '2.75rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
              Simple Plans for Serious Wealth Builders
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Start free forever with generous limits, or unlock unlimited tracking and family profiles with a single lifetime investment. No recurring subscriptions.
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', maxWidth: '880px', margin: '0 auto 4rem auto' }}>
            {/* Free Plan */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2.5rem' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Free Forever</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  Ideal for individual investors getting started with manual net worth tracking.
                </p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>₹0</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ forever</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Check size={16} color="var(--brand-primary)" />
                    <span>Up to <strong>25 active assets</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Check size={16} color="var(--brand-primary)" />
                    <span>Up to <strong>5 liabilities / loans</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Check size={16} color="var(--brand-primary)" />
                    <span>Up to <strong>3 financial goals</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Check size={16} color="var(--brand-primary)" />
                    <span><strong>2 net worth snapshots</strong> / month</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Check size={16} color="var(--brand-primary)" />
                    <span>All 6 client-side financial calculators</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Check size={16} color="var(--brand-primary)" />
                    <span>Zerodha & Groww statement imports</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2.5rem' }}>
                <Link href="/login?mode=register" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                  Get Started Free
                </Link>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2.5rem', border: '2px solid var(--brand-primary)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 18, 26, 0.85) 100%)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', right: '24px', background: 'var(--brand-primary)', color: '#000', fontWeight: 800, fontSize: '0.75rem', padding: '0.2rem 0.65rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Most Popular
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Sparkles size={20} color="var(--brand-primary)" />
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>FinQuest Pro</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  For serious wealth builders, multi-asset portfolios, and complete peace of mind.
                </p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--brand-primary)' }}>₹2,999</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ one-time lifetime</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Check size={16} color="var(--brand-primary)" />
                    <span><strong>Unlimited</strong> portfolio assets</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Check size={16} color="var(--brand-primary)" />
                    <span><strong>Unlimited</strong> liabilities & loans</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Check size={16} color="var(--brand-primary)" />
                    <span><strong>Unlimited</strong> financial goals</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Check size={16} color="var(--brand-primary)" />
                    <span><strong>Unlimited</strong> monthly net worth snapshots</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Check size={16} color="var(--brand-primary)" />
                    <span><strong>Family profile switching</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Check size={16} color="var(--brand-primary)" />
                    <span>Complete JSON & CSV data exports</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Check size={16} color="var(--brand-primary)" />
                    <span>Zero recurring monthly or annual fees</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2.5rem' }}>
                <button
                  onClick={() => setShowCheckoutModal(true)}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem', boxShadow: 'var(--brand-glow)' }}
                >
                  <span>Upgrade to Pro Lifetime</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="glass-card" style={{ maxWidth: '880px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>Detailed Plan Comparison</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Feature</th>
                    <th style={{ padding: '0.75rem 1rem', width: '25%', textAlign: 'center' }}>Free Forever</th>
                    <th style={{ padding: '0.75rem 1rem', width: '25%', textAlign: 'center', color: 'var(--brand-primary)' }}>FinQuest Pro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Portfolio Asset Limit</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>25 Assets</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700, color: 'var(--brand-primary)' }}>Unlimited</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Liabilities & Loans</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>5 Loans</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700, color: 'var(--brand-primary)' }}>Unlimited</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Goal Tracking Milestones</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>3 Goals</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700, color: 'var(--brand-primary)' }}>Unlimited</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Net Worth Snapshots</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>2 / month</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700, color: 'var(--brand-primary)' }}>Unlimited</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Financial Calculators (XIRR, SIP, EMI, etc.)</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}><Check size={16} color="var(--brand-primary)" style={{ display: 'inline' }} /></td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}><Check size={16} color="var(--brand-primary)" style={{ display: 'inline' }} /></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Broker CSV Statement Import</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}><Check size={16} color="var(--brand-primary)" style={{ display: 'inline' }} /></td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}><Check size={16} color="var(--brand-primary)" style={{ display: 'inline' }} /></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Family Profiles</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}><Cross size={16} color="var(--text-muted)" style={{ display: 'inline' }} /></td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}><Check size={16} color="var(--brand-primary)" style={{ display: 'inline' }} /></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Complete Data Ownership & Full JSON/CSV Export</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}><Check size={16} color="var(--brand-primary)" style={{ display: 'inline' }} /></td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}><Check size={16} color="var(--brand-primary)" style={{ display: 'inline' }} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Checkout Gateway Simulation Modal */}
      {showCheckoutModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '460px', border: '1px solid var(--brand-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.25rem' }}>Secure Checkout</h3>
              </div>
              <button onClick={() => setShowCheckoutModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <Cross size={20} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>FinQuest Pro (Lifetime)</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>One-time payment, unlimited access</div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-primary)' }}>₹2,999</div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.6rem' }}>Select Payment Method</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: paymentMethod === 'upi' ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                    background: paymentMethod === 'upi' ? 'var(--brand-primary-light)' : 'transparent',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Smartphone size={18} color="var(--brand-primary)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>UPI / QR (Instant)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Google Pay, PhonePe, Paytm, BHIM</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: paymentMethod === 'card' ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                    background: paymentMethod === 'card' ? 'var(--brand-primary-light)' : 'transparent',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <CreditCard size={18} color="#38bdf8" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Credit / Debit Card</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Visa, Mastercard, RuPay, Amex</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: paymentMethod === 'netbanking' ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                    background: paymentMethod === 'netbanking' ? 'var(--brand-primary-light)' : 'transparent',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Building size={18} color="#f59e0b" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>NetBanking</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HDFC, ICICI, SBI, Axis & 50+ banks</div>
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={handleUpgradeToPro}
              disabled={processing}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem' }}
            >
              {processing ? 'Confirming Payment...' : 'Complete Payment of ₹2,999'}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
