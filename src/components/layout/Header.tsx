'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Moon, Sun, Menu, X, ArrowRight, Wallet, User, LogOut } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeSync';

export function Header() {
  const { theme, toggleTheme, setAuthSession } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    setAuthSession(false);
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-opacity-80 border-b border-[var(--border-subtle)]" style={{ backgroundColor: 'var(--bg-surface-glass)', backdropFilter: 'var(--backdrop-blur)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.25rem' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.03em', flexShrink: 0 }}>
          <div style={{ width: '2rem', height: '2rem', borderRadius: '8px', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: 'var(--brand-glow)' }}>
            <Wallet size={18} />
          </div>
          <span>Fin<span style={{ color: 'var(--brand-primary)' }}>Quest</span></span>
        </Link>

        {/* Public Desktop Nav Links */}
        <nav data-auth="out" style={{ display: 'none', alignItems: 'center', gap: '1.75rem', fontSize: '0.925rem', color: 'var(--text-secondary)' }} className="desktop-nav">
          <Link href="/#how-it-works" style={{ transition: 'color 150ms' }}>How It Works</Link>
          <Link href="/#features" style={{ transition: 'color 150ms' }}>Features</Link>
          <Link href="/calculators" style={{ transition: 'color 150ms' }}>Calculators</Link>
          <Link href="/#reviews" style={{ transition: 'color 150ms' }}>Reviews</Link>
          <Link href="/pricing" style={{ transition: 'color 150ms' }}>Pricing</Link>
          <Link href="/demo" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Demo</Link>
        </nav>

        {/* Authenticated Desktop Nav Links */}
        <nav data-auth="in" style={{ display: 'none', alignItems: 'center', gap: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }} className="desktop-nav">
          <Link href="/dashboard" style={{ transition: 'color 150ms' }}>Dashboard</Link>
          <Link href="/assets" style={{ transition: 'color 150ms' }}>Assets</Link>
          <Link href="/liabilities" style={{ transition: 'color 150ms' }}>Liabilities</Link>
          <Link href="/money" style={{ transition: 'color 150ms' }}>Money</Link>
          <Link href="/goals" style={{ transition: 'color 150ms' }}>Goals</Link>
          <Link href="/snapshots" style={{ transition: 'color 150ms' }}>Snapshots</Link>
          <Link href="/allocation" style={{ transition: 'color 150ms' }}>Allocation</Link>
          <Link href="/essentials" style={{ transition: 'color 150ms' }}>Essentials</Link>
          <Link href="/settings" style={{ transition: 'color 150ms' }}>Settings</Link>
        </nav>

        {/* Controls & Auth CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Logged Out CTAs */}
          <div data-auth="out" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/login" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Sign in
            </Link>
            <Link href="/login?mode=register" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              <span>Get Started</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Logged In CTAs */}
          <div data-auth="in" style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/dashboard" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              <span>Dashboard</span>
              <ArrowRight size={15} />
            </Link>
            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title="Sign Out"
            >
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          </div>

          {/* Mobile Hamburger Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
            data-slot="sheet-trigger"
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Sheet) */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '4.25rem',
            left: 0,
            right: 0,
            background: 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-medium)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Public Links in Mobile Drawer */}
          <div data-auth="out" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
            <Link href="/#features" onClick={() => setMobileMenuOpen(false)}>Features</Link>
            <Link href="/calculators" onClick={() => setMobileMenuOpen(false)}>Calculators</Link>
            <Link href="/#reviews" onClick={() => setMobileMenuOpen(false)}>Reviews</Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
            <Link href="/demo" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
              Try Live Demo
            </Link>
            <hr style={{ borderColor: 'var(--border-subtle)' }} />
            <Link href="/login" className="btn-secondary" onClick={() => setMobileMenuOpen(false)} style={{ textAlign: 'center' }}>
              Sign in
            </Link>
            <Link href="/login?mode=register" className="btn-primary" onClick={() => setMobileMenuOpen(false)} style={{ textAlign: 'center' }}>
              Get Started Free
            </Link>
          </div>

          {/* Authenticated Links in Mobile Drawer */}
          <div data-auth="in" style={{ display: 'none', flexDirection: 'column', gap: '0.9rem' }}>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
            <Link href="/assets" onClick={() => setMobileMenuOpen(false)}>Assets Portfolio</Link>
            <Link href="/liabilities" onClick={() => setMobileMenuOpen(false)}>Liabilities & Debt</Link>
            <Link href="/money" onClick={() => setMobileMenuOpen(false)}>Income & Expenses</Link>
            <Link href="/money/insights" onClick={() => setMobileMenuOpen(false)}>Cashflow Insights</Link>
            <Link href="/goals" onClick={() => setMobileMenuOpen(false)}>Financial Goals</Link>
            <Link href="/snapshots" onClick={() => setMobileMenuOpen(false)}>Net Worth Snapshots</Link>
            <Link href="/allocation" onClick={() => setMobileMenuOpen(false)}>Asset Allocation</Link>
            <Link href="/essentials" onClick={() => setMobileMenuOpen(false)}>Essentials Health</Link>
            <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>Settings</Link>
            <hr style={{ borderColor: 'var(--border-subtle)' }} />
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="btn-outline"
              style={{ textAlign: 'center', justifyContent: 'center' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 992px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
