import { UsageTracking } from '../../domain/entities/UsageTracking';
import { IUsageTrackingRepository } from '../../domain/repositories/IUsageTrackingRepository';
import { Database } from '../database/Database';

export class UsageTrackingRepository implements IUsageTrackingRepository {
  async findByUserIdAndMonth(
    userId: string,
    month: number,
    year: number
  ): Promise<UsageTracking | null> {
    const result = await Database.getInstance().query(
      'SELECT * FROM usage_tracking WHERE user_id = $1 AND month = $2 AND year = $3',
      [userId, month, year]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToTracking(result.rows[0]);
  }

  async save(tracking: UsageTracking): Promise<UsageTracking> {
    const result = await Database.getInstance().query(
      `INSERT INTO usage_tracking (id, user_id, month, year, free_messages_used, last_reset_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
       RETURNING *`,
      [
        tracking.userId,
        tracking.month,
        tracking.year,
        tracking.freeMessagesUsed,
        tracking.lastResetAt,
      ]
    );

    return this.mapRowToTracking(result.rows[0]);
  }

  async update(tracking: UsageTracking): Promise<UsageTracking> {
    const result = await Database.getInstance().query(
      `UPDATE usage_tracking 
       SET free_messages_used = $1, last_reset_at = $2
       WHERE id = $3
       RETURNING *`,
      [tracking.freeMessagesUsed, tracking.lastResetAt, tracking.id]
    );

    return this.mapRowToTracking(result.rows[0]);
  }

  async findAllNeedingReset(): Promise<UsageTracking[]> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();

    // Find all trackings from previous months or current month if it's the 1st
    const result = await Database.getInstance().query(
      `SELECT * FROM usage_tracking 
       WHERE (year < $1 OR (year = $1 AND month < $2))
       OR (year = $1 AND month = $2 AND $3 = 1)
       AND free_messages_used > 0`,
      [currentYear, currentMonth, currentDay]
    );

    return result.rows.map((row) => this.mapRowToTracking(row));
  }

  private mapRowToTracking(row: any): UsageTracking {
    return new UsageTracking(
      row.id,
      row.user_id,
      row.month,
      row.year,
      row.free_messages_used,
      row.last_reset_at
    );
  }
}

