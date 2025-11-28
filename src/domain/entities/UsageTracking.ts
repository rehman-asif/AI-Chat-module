export class UsageTracking {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly month: number,
    public readonly year: number,
    public readonly freeMessagesUsed: number,
    public readonly lastResetAt: Date
  ) {}

  static create(userId: string, month: number, year: number, id: string = ''): UsageTracking {
    return new UsageTracking(
      id,
      userId,
      month,
      year,
      0,
      new Date()
    );
  }

  incrementFreeUsage(): UsageTracking {
    if (this.freeMessagesUsed >= 3) {
      throw new Error('Free quota exhausted');
    }
    return new UsageTracking(
      this.id,
      this.userId,
      this.month,
      this.year,
      this.freeMessagesUsed + 1,
      this.lastResetAt
    );
  }

  reset(): UsageTracking {
    return new UsageTracking(
      this.id,
      this.userId,
      this.month,
      this.year,
      0,
      new Date()
    );
  }

  get hasFreeQuota(): boolean {
    return this.freeMessagesUsed < 3;
  }
}

