import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';

describe('Financial Goals & Quota Enforcement (F-15)', () => {
  beforeEach(() => {
    db.resetDatabase();
    db.seedDemoData();
  });

  it('allows adding goals up to the Free plan quota of 3', () => {
    // Initial goals in DB: 2
    expect(db.getGoals().length).toBe(2);

    // Add 3rd goal
    const result3 = db.addGoal({
      name: 'Kids College Fund',
      target_amount: 1500000,
      target_date: '2030-05-31',
      category: 'EDUCATION',
      linked_asset_ids: [],
      current_amount: 200000,
    });
    expect(result3.success).toBe(true);
    expect(db.getGoals().length).toBe(3);

    // Attempting 4th goal on Free plan must be blocked
    const result4 = db.addGoal({
      name: 'Europe Vacation',
      target_amount: 400000,
      target_date: '2027-08-15',
      category: 'TRAVEL',
      linked_asset_ids: [],
      current_amount: 50000,
    });
    expect(result4.success).toBe(false);
    expect(result4.error?.code).toBe('GOAL_LIMIT_REACHED');
    expect(result4.error?.max_allowed).toBe(3);
  });

  it('unlocks unlimited goals when upgraded to Pro tier', () => {
    db.updateUserProfile({ subscription_status: 'pro' });

    // Add 3rd goal
    db.addGoal({
      name: 'Goal 3',
      target_amount: 100000,
      target_date: '2028-01-01',
      category: 'CUSTOM',
      linked_asset_ids: [],
    });

    // Add 4th goal (allowed on Pro)
    const result4 = db.addGoal({
      name: 'Goal 4',
      target_amount: 200000,
      target_date: '2029-01-01',
      category: 'CUSTOM',
      linked_asset_ids: [],
    });
    expect(result4.success).toBe(true);
    expect(db.getGoals().length).toBe(4);
  });

  it('computes accumulated progress dynamically from linked assets', () => {
    const goals = db.getGoals();
    const emergencyFundGoal = goals.find((g) => g.id === 'goal-1');
    expect(emergencyFundGoal).toBeDefined();

    // Goal 1 is linked to asset-5 (HDFC Savings Bank with current_value = 1,000,000)
    // Target is 500,000. So currentVal = 1,000,000, progress = 100%
    expect(emergencyFundGoal?.current_amount).toBe(1000000);
    expect(emergencyFundGoal?.progress_percentage).toBe(100);
  });
});
