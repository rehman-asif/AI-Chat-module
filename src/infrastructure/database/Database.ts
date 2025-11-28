import { Pool, PoolClient } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

export class Database {
  private static pool: Pool;

  static getInstance(): Pool {
    if (!this.pool) {
      this.pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'ai_chat_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
      });
    }
    return this.pool;
  }

  static async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }

  static async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

