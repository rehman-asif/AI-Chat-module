import { BundleTier } from '../entities/Bundle';

export class BundleQuota {
  private static readonly TIER_QUOTAS: Record<BundleTier, number> = {
    [BundleTier.BASIC]: 10,
    [BundleTier.PRO]: 100,
    [BundleTier.ENTERPRISE]: Number.MAX_SAFE_INTEGER
  };

  static getQuotaForTier(tier: BundleTier): number {
    return this.TIER_QUOTAS[tier];
  }

  static isUnlimited(tier: BundleTier): boolean {
    return tier === BundleTier.ENTERPRISE;
  }
}

