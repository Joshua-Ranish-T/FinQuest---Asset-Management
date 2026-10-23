'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Calculator, TrendingUp, DollarSign, Calendar, Percent, ShieldCheck, ArrowRight } from 'lucide-react';

const calculators = [
  {
    id: 'xirr',
    title: 'XIRR Calculator',
    description: 'Calculate annualized returns on SIPs, multiple cash inflows, and irregular redemptions.',
    tag: 'Returns',
    icon: TrendingUp,
    href: '/calculators/xirr',
  },
  {
    id: 'sip',
    title: 'SIP Calculator',
    description: 'Estimate future wealth from monthly mutual fund SIPs with optional annual step-up.',
    tag: 'Returns',
    icon: Calculator,
    href: '/calculators/sip',
  },
  {
    id: 'lumpsum',
    title: 'Lumpsum Calculator',
    description: 'Project the compounding growth of a one-time lump sum investment over years.',
    tag: 'Returns',
    icon: DollarSign,
    href: '/calculators/lumpsum',
  },
  {
    id: 'cagr',
    title: 'CAGR Calculator',
    description: 'Determine the Compound Annual Growth Rate between initial and final portfolio values.',
    tag: 'Returns',
    icon: Percent,
    href: '/calculators/cagr',
  },
  {
    id: 'emi',
    title: 'EMI Calculator',
    description: 'Compute monthly loan installments and principal vs interest amortization schedules.',
    tag: 'Loans',
    icon: Calendar,
    href: '/calculators/emi',
  },
  {
    id: 'fd',
    title: 'FD Calculator',
    description: 'Forecast fixed deposit maturity amounts with quarterly compound interest compounding.',
    tag: 'Planning',
    icon: ShieldCheck,
    href: '/calculators/fd',
  },
];

export default function CalculatorsPage() {
  return (
    <>
      <Header />
      <main style={{ padding: '4rem 0', flex: 1 }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem auto' }}>
            <span className="badge badge-emerald">Free In-Browser Tools</span>
            <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
              Financial Calculators
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Perform complex financial calculations instantly. 100% private and computed right in your browser with zero data transmission.
            </p>
          </div>

          <div className="grid-cols-3">
            {calculators.map((calc) => {
              const Icon = calc.icon;
              return (
                <Link key={calc.id} href={calc.href} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '10px', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={22} />
                      </div>
                      <span className="badge badge-muted">{calc.tag}</span>
                    </div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{calc.title}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                      {calc.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-primary)', fontSize: '0.875rem', fontWeight: 600 }}>
                    <span>Calculate Now</span>
                    <ArrowRight size={15} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
