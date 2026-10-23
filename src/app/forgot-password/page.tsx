'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft, KeyRound, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your account email address.');
      return;
    }

    setLoading(true);
    // Simulate Supabase auth password reset dispatch
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Password reset instructions sent to your email.');
    }, 600);
  };

  return (
    <>
      <Header />
      <main style={{ padding: '5rem 0', flex: 1, display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '440px' }}>
          <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to sign in</span>
            </Link>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  width: '3.25rem',
                  height: '3.25rem',
                  borderRadius: '12px',
                  background: 'var(--brand-primary-light)',
                  color: 'var(--brand-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <KeyRound size={26} />
              </div>
              <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Reset Password</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Enter the email address associated with your FinQuest account, and we will send a recovery link.
              </p>
            </div>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ color: 'var(--brand-primary)', display: 'inline-flex', marginBottom: '0.75rem' }}>
                  <CheckCircle2 size={36} />
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Check your inbox</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  We sent password reset instructions to <strong>{email}</strong>. Check your spam folder if it doesn&apos;t arrive in 2 minutes.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Resend Email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      placeholder="investor@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '2.5rem' }}
                      required
                    />
                    <Mail
                      size={18}
                      color="var(--text-muted)"
                      style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }}
                >
                  {loading ? 'Sending link...' : 'Send Recovery Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
