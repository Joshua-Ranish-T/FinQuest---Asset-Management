import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';

describe('Net Worth Snapshots & Monthly Quota Enforcement (F-16)', () => {
  beforeEach(() => {
    db.resetDatabase();
    db.seedDemoData();
  });

  it('allows capturing snapshot checkpoints and enforces 2 snapshots per month on Free', () => {
    const summary = db.getPortfolioSummary();
    expect(summary.totalAssets).toBeGreaterThan(0);
    expect(summary.totalLiabilities).toBeGreaterThan(0);

    // Initial snapshots in October: 1 snapshot exists (2026-10-01)
    // Adding 2nd snapshot for the month
    const snap2 = db.addSnapshot();
    expect(snap2.success).toBe(true);
    expect(snap2.data?.net_worth).toBe(summary.netWorth);

    // Attempting 3rd snapshot in the same month on Free plan must be blocked
    const snap3 = db.addSnapshot();
    expect(snap3.success).toBe(false);
    expect(snap3.error?.code).toBe('SNAPSHOT_LIMIT_REACHED');
    expect(snap3.error?.max_allowed).toBe(2);
  });

  it('permits unlimited snapshots when user has Pro subscription', () => {
    db.updateUserProfile({ subscription_status: 'pro' });

    // 2nd snapshot
    db.addSnapshot();

    // 3rd snapshot allowed on Pro
    const snap3 = db.addSnapshot();
    expect(snap3.success).toBe(true);

    // 4th snapshot allowed on Pro
    const snap4 = db.addSnapshot();
    expect(snap4.success).toBe(true);
  });
});
