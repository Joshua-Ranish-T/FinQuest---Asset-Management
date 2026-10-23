'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useTheme } from '@/components/theme/ThemeSync';
import { Wallet, Eye, EyeOff, Lock, Mail } from 'lucide-react';

import { api, ApiError } from '@/lib/api-client';
import { isSupabaseConfigured, getSupabaseBrowserClient } from '@/lib/supabase';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthSession } = useTheme();

  const [isRegister, setIsRegister] = useState(() => searchParams.get('mode') === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      await api.post(endpoint, { email, password });
      setAuthSession(true);
      toast.success(isRegister ? 'Account created successfully!' : 'Signed in successfully!');
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Authentication failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) {
          toast.error(error.message);
          setLoading(false);
        }
        return;
      }
    }

    toast.info('Google OAuth requires Supabase credentials in .env.local. Please create an account or sign in with email & password.');
  };

  return (
    <div className="glass-card" style={{ padding: '2.5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ width: '3rem', height: '3rem', borderRadius: '12px', background: 'var(--brand-gradient)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: '1rem', boxShadow: 'var(--brand-glow)' }}>
          <Wallet size={24} />
        </div>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {isRegister ? 'Start tracking your consolidated wealth privately' : 'Sign in to access your wealth dashboard'}
        </p>
      </div>

      {/* Google OAuth Button */}
      <button
        onClick={handleGoogleAuth}
        disabled={loading}
        className="btn-secondary"
        style={{ width: '100%', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.75rem' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        <span>or use email</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
      </div>

      {/* Email Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            Email address
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-control"
              style={{ paddingLeft: '2.5rem' }}
            />
            <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Password</label>
            {!isRegister && (
              <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--brand-primary)' }}>
                Forgot password?
              </Link>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-control"
              style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
            />
            <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
        >
          {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      {/* Toggle Mode */}
      <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        {isRegister ? (
          <>
            Already have an account?{' '}
            <button
              onClick={() => setIsRegister(false)}
              style={{ color: 'var(--brand-primary)', fontWeight: 600 }}
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            No account yet?{' '}
            <button
              onClick={() => setIsRegister(true)}
              style={{ color: 'var(--brand-primary)', fontWeight: 600 }}
            >
              Create one
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <main style={{ padding: '4rem 0', flex: 1, display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '440px' }}>
          <Suspense fallback={<div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
