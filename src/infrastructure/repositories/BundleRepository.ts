import { Bundle, BundleTier } from '../../domain/entities/Bundle';
import { IBundleRepository } from '../../domain/repositories/IBundleRepository';
import { Database } from '../database/Database';

export class BundleRepository implements IBundleRepository {
  async findActiveByUserId(userId: string): Promise<Bundle[]> {
    const now = new Date();
    const result = await Database.getInstance().query(
      `SELECT * FROM bundles 
       WHERE user_id = $1 
       AND remaining_quota > 0 
       AND (expires_at IS NULL OR expires_at > $2)
       ORDER BY created_at DESC`,
      [userId, now]
    );

    return result.rows.map((row) => this.mapRowToBundle(row));
  }

  async findLatestActiveByUserId(userId: string): Promise<Bundle | null> {
    const now = new Date();
    const result = await Database.getInstance().query(
      `SELECT * FROM bundles 
       WHERE user_id = $1 
       AND remaining_quota > 0 
       AND (expires_at IS NULL OR expires_at > $2)
       ORDER BY remaining_quota DESC, created_at DESC
       LIMIT 1`,
      [userId, now]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToBundle(result.rows[0]);
  }

  async save(bundle: Bundle): Promise<Bundle> {
    const result = await Database.getInstance().query(
      `INSERT INTO bundles (id, user_id, tier, quota, remaining_quota, created_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        bundle.id,
        bundle.userId,
        bundle.tier,
        bundle.quota,
        bundle.remainingQuota,
        bundle.createdAt,
        bundle.expiresAt,
      ]
    );

    return this.mapRowToBundle(result.rows[0]);
  }

  async update(bundle: Bundle): Promise<Bundle> {
    const result = await Database.getInstance().query(
      `UPDATE bundles 
       SET remaining_quota = $1
       WHERE id = $2
       RETURNING *`,
      [bundle.remainingQuota, bundle.id]
    );

    return this.mapRowToBundle(result.rows[0]);
  }

  private mapRowToBundle(row: any): Bundle {
    return new Bundle(
      row.id,
      row.user_id,
      row.tier as BundleTier,
      row.quota,
      row.remaining_quota,
      row.created_at,
      row.expires_at
    );
  }
}

