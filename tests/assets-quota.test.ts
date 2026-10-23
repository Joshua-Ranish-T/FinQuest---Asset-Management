import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { AssetClass } from '@/types';

describe('F-12: Asset & Liability Tracking and Quota Enforcement', () => {
  beforeEach(() => {
    db.resetDatabase();
    db.seedDemoData();
  });

  it('allows adding assets across multiple asset classes', () => {
    const classes: AssetClass[] = ['EQUITY', 'US_EQUITY', 'MUTUAL_FUND', 'EPF', 'GOLD', 'REAL_ESTATE', 'CRYPTO'];
    
    classes.forEach((ac, idx) => {
      const res = db.addAsset({
        name: `Test Asset ${idx}`,
        asset_class: ac,
        quantity: 10,
        buy_price: 1000,
        current_value: 1500,
        currency: 'INR',
      });
      expect(res.success).toBe(true);
      expect(res.data?.asset_class).toBe(ac);
    });
  });

  it('supports updating asset valuation and details', () => {
    const assets = db.getAssets();
    const first = assets[0];
    
    const updated = db.updateAsset(first.id, {
      name: 'Updated Nifty Index Fund',
      current_value: 3000000,
      notes: 'Reviewed valuation',
    });

    expect(updated).not.toBeNull();
    expect(updated?.name).toBe('Updated Nifty Index Fund');
    expect(updated?.current_value).toBe(3000000);
    expect(updated?.notes).toBe('Reviewed valuation');
  });

  it('supports deleting an asset and reflects in summary', () => {
    const initialAssets = db.getAssets();
    const toDelete = initialAssets[0];
    
    const initialSummary = db.getPortfolioSummary();
    const deleted = db.deleteAsset(toDelete.id);
    expect(deleted).toBe(true);

    const newAssets = db.getAssets();
    expect(newAssets.length).toBe(initialAssets.length - 1);

    const newSummary = db.getPortfolioSummary();
    expect(newSummary.totalAssets).toBe(initialSummary.totalAssets - toDelete.current_value);
    expect(newSummary.netWorth).toBe(newSummary.totalAssets - newSummary.totalLiabilities);
  });

  it('enforces the 25-asset Free Tier quota limit strictly', () => {
    // Current initial demo assets count is 5
    const currentCount = db.getAssets().length;
    const remainingToQuota = 25 - currentCount;

    // Add until 25
    for (let i = 0; i < remainingToQuota; i++) {
      const res = db.addAsset({
        name: `Quota Test Asset ${i}`,
        asset_class: 'EQUITY',
        quantity: 1,
        buy_price: 100,
        current_value: 100,
        currency: 'INR',
      });
      expect(res.success).toBe(true);
    }

    expect(db.getAssets().length).toBe(25);

    // Attempt to add 26th asset
    const res26 = db.addAsset({
      name: '26th Asset (Should Fail)',
      asset_class: 'MUTUAL_FUND',
      quantity: 1,
      buy_price: 100,
      current_value: 100,
      currency: 'INR',
    });

    expect(res26.success).toBe(false);
    expect(res26.error?.code).toBe('ASSET_LIMIT_REACHED');
    expect(res26.error?.max_allowed).toBe(25);
    expect(db.getAssets().length).toBe(25);
  });

  it('enforces the 5-liabilities Free Tier quota limit strictly', () => {
    // Current initial demo liabilities count is 1
    const currentCount = db.getLiabilities().length;
    const remainingToQuota = 5 - currentCount;

    // Add until 5
    for (let i = 0; i < remainingToQuota; i++) {
      const res = db.addLiability({
        name: `Quota Test Loan ${i}`,
        liability_type: 'PERSONAL_LOAN',
        principal_outstanding: 50000,
        currency: 'INR',
      });
      expect(res.success).toBe(true);
    }

    expect(db.getLiabilities().length).toBe(5);

    // Attempt to add 6th liability
    const res6 = db.addLiability({
      name: '6th Loan (Should Fail)',
      liability_type: 'CREDIT_CARD',
      principal_outstanding: 25000,
      currency: 'INR',
    });

    expect(res6.success).toBe(false);
    expect(res6.error?.code).toBe('LIABILITY_LIMIT_REACHED');
    expect(res6.error?.max_allowed).toBe(5);
    expect(db.getLiabilities().length).toBe(5);
  });

  it('allows unlimited assets and liabilities when upgraded to Pro tier', () => {
    // Upgrade user to Pro
    db.updateUserProfile({ subscription_status: 'pro' });

    // Fill to 25 assets
    const remaining = 25 - db.getAssets().length;
    for (let i = 0; i < remaining; i++) {
      db.addAsset({
        name: `Pro Asset ${i}`,
        asset_class: 'GOLD',
        quantity: 1,
        buy_price: 100,
        current_value: 100,
        currency: 'INR',
      });
    }

    // Add 26th, 27th, 28th asset
    for (let i = 26; i <= 28; i++) {
      const res = db.addAsset({
        name: `Pro Asset ${i}`,
        asset_class: 'REAL_ESTATE',
        quantity: 1,
        buy_price: 1000000,
        current_value: 1000000,
        currency: 'INR',
      });
      expect(res.success).toBe(true);
    }

    expect(db.getAssets().length).toBe(28);
  });
});
