import { IUsageTrackingRepository } from '../../domain/repositories/IUsageTrackingRepository';

export class QuotaResetService {
  constructor(private usageTrackingRepository: IUsageTrackingRepository) {}

  async resetMonthlyFreeQuotas(): Promise<number> {
    const trackingsToReset = await this.usageTrackingRepository.findAllNeedingReset();
    
    let resetCount = 0;
    for (const tracking of trackingsToReset) {
      const resetTracking = tracking.reset();
      await this.usageTrackingRepository.update(resetTracking);
      resetCount++;
    }

    return resetCount;
  }
}

