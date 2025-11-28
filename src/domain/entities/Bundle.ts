export enum BundleTier {
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export class Bundle {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tier: BundleTier,
    public readonly quota: number,
    public readonly remainingQuota: number,
    public readonly createdAt: Date,
    public readonly expiresAt: Date | null
  ) {}

  static create(
    id: string,
    userId: string,
    tier: BundleTier,
    quota: number,
    expiresAt: Date | null = null
  ): Bundle {
    return new Bundle(id, userId, tier, quota, quota, new Date(), expiresAt);
  }

  get isActive(): boolean {
    if (this.expiresAt === null) return true;
    return this.expiresAt > new Date() && this.remainingQuota > 0;
  }

  canDeduct(amount: number): boolean {
    return this.isActive && this.remainingQuota >= amount;
  }

  deduct(amount: number): Bundle {
    if (!this.canDeduct(amount)) {
      throw new Error('Insufficient quota in bundle');
    }
    return new Bundle(
      this.id,
      this.userId,
      this.tier,
      this.quota,
      this.remainingQuota - amount,
      this.createdAt,
      this.expiresAt
    );
  }
}

