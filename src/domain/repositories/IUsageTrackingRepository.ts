import { UsageTracking } from '../entities/UsageTracking';

export interface IUsageTrackingRepository {
  findByUserIdAndMonth(userId: string, month: number, year: number): Promise<UsageTracking | null>;
  save(tracking: UsageTracking): Promise<UsageTracking>;
  update(tracking: UsageTracking): Promise<UsageTracking>;
  findAllNeedingReset(): Promise<UsageTracking[]>;
}

