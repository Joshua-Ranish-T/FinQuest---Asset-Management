import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db";

describe("Data Export & Account Wipe (F-22, F-23)", () => {
  beforeEach(() => {
    db.resetDatabase();
    db.seedDemoData();
  });

  it("exportAllData includes all entity collections with correct keys", () => {
    const exported = db.exportAllData();

    expect(exported).toHaveProperty("exported_at");
    expect(exported).toHaveProperty("profile");
    expect(exported).toHaveProperty("assets");
    expect(exported).toHaveProperty("liabilities");
    expect(exported).toHaveProperty("goals");
    expect(exported).toHaveProperty("transactions");
    expect(exported).toHaveProperty("snapshots");

    // Verify that initial demo data is present in the export
    expect(exported.assets.length).toBeGreaterThan(0);
    expect(exported.transactions.length).toBeGreaterThan(0);
    expect(exported.snapshots.length).toBeGreaterThan(0);
  });

  it("exportAllData reflects newly added assets and transactions", () => {
    db.addAsset({
      name: "Tata Motors Shares",
      asset_class: "EQUITY",
      quantity: 100,
      buy_price: 850,
      current_value: 91000,
      currency: "INR",
    });

    db.addTransaction({
      type: "INCOME",
      category: "Dividends",
      amount: 3500,
      currency: "INR",
      date: "2026-10-20",
    });

    const exported = db.exportAllData();
    expect(exported.assets.some((a) => a.name === "Tata Motors Shares")).toBe(true);
    expect(exported.transactions.some((t) => t.category === "Dividends")).toBe(true);
  });

  it("wipeAllData clears all portfolio records", () => {
    db.wipeAllData();

    expect(db.getAssets()).toHaveLength(0);
    expect(db.getLiabilities()).toHaveLength(0);
    expect(db.getGoals()).toHaveLength(0);
    expect(db.getTransactions()).toHaveLength(0);
    expect(db.getSnapshots()).toHaveLength(0);
  });

  it("wipeAllData empties the export payload after wipe", () => {
    db.wipeAllData();
    const exported = db.exportAllData();
    expect(exported.assets).toHaveLength(0);
    expect(exported.transactions).toHaveLength(0);
    expect(exported.snapshots).toHaveLength(0);
  });
});

describe("Pro Upgrade & Quota Release (F-21)", () => {
  beforeEach(() => {
    db.resetDatabase();
    db.seedDemoData();
  });

  it("upgrade to Pro releases the 25-asset quota cap", () => {
    // Fill to 25
    const remaining = 25 - db.getAssets().length;
    for (let i = 0; i < remaining; i++) {
      db.addAsset({ name: `Asset ${i}`, asset_class: "CASH", quantity: 1, buy_price: 100, current_value: 100, currency: "INR" });
    }
    expect(db.getAssets().length).toBe(25);

    // Still blocked before upgrade
    const blockedRes = db.addAsset({ name: "26th Asset", asset_class: "EQUITY", quantity: 1, buy_price: 100, current_value: 100, currency: "INR" });
    expect(blockedRes.success).toBe(false);

    // Upgrade and retry
    db.updateUserProfile({ subscription_status: "pro" });
    const proRes = db.addAsset({ name: "26th Asset Post Upgrade", asset_class: "EQUITY", quantity: 1, buy_price: 100, current_value: 100, currency: "INR" });
    expect(proRes.success).toBe(true);
    expect(db.getAssets().length).toBe(26);
  });

  it("upgrade to Pro releases the snapshot quota cap", () => {
    // Add 2 snapshots to hit monthly cap
    db.addSnapshot();
    const capped = db.addSnapshot();
    expect(capped.success).toBe(false); // blocked at 2nd additional (initial has 1)

    // Wait — initial data already has 1 snapshot in 2026-10, let s attempt should work
    db.updateUserProfile({ subscription_status: "pro" });
    const proSnap = db.addSnapshot();
    expect(proSnap.success).toBe(true);
  });

  it("profile limits reflect live Pro status after upgrade", () => {
    db.updateUserProfile({ subscription_status: "pro" });
    const profile = db.getUserProfile();
    expect(profile.subscription_status).toBe("pro");
  });
});

describe("Goals CRUD & Progress (F-15)", () => {
  beforeEach(() => {
    db.resetDatabase();
    db.seedDemoData();
  });

  it("can update a goal name, target amount, and target date", () => {
    const goals = db.getGoals();
    const first = goals[0];

    const updated = db.updateGoal(first.id, {
      name: "Updated Emergency Fund",
      target_amount: 750000,
      target_date: "2028-12-31",
    });

    expect(updated).not.toBeNull();
    expect(updated?.name).toBe("Updated Emergency Fund");
    expect(updated?.target_amount).toBe(750000);
  });

  it("can delete a goal and it disappears from the list", () => {
    const before = db.getGoals();
    const toDelete = before[0];

    const deleted = db.deleteGoal(toDelete.id);
    expect(deleted).toBe(true);

    const after = db.getGoals();
    expect(after.length).toBe(before.length - 1);
    expect(after.find((g) => g.id === toDelete.id)).toBeUndefined();
  });

  it("updateGoal returns null for an unknown goal ID", () => {
    const result = db.updateGoal("nonexistent-id", { name: "Ghost Goal" });
    expect(result).toBeNull();
  });

  it("deleteGoal returns false for an unknown goal ID", () => {
    const result = db.deleteGoal("nonexistent-id");
    expect(result).toBe(false);
  });
});
