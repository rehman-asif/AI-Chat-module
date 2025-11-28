import * as cron from 'node-cron';
import { QuotaResetService } from '../../application/services/QuotaResetService';
import { UsageTrackingRepository } from '../repositories/UsageTrackingRepository';

export class QuotaResetScheduler {
  private static isRunning = false;

  static start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // Run at 00:00 on the 1st day of every month
    cron.schedule('0 0 1 * *', async () => {
      try {
        console.log('Starting monthly quota reset...');
        const usageTrackingRepository = new UsageTrackingRepository();
        const quotaResetService = new QuotaResetService(usageTrackingRepository);
        const resetCount = await quotaResetService.resetMonthlyFreeQuotas();
        console.log(`Monthly quota reset completed. Reset ${resetCount} users.`);
      } catch (error) {
        console.error('Error during monthly quota reset:', error);
      }
    });

    console.log('Quota reset scheduler started. Will run on the 1st of each month at 00:00.');
  }
}

