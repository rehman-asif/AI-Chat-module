import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Database } from '../database/Database';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const result = await Database.getInstance().query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return new User(row.id, row.email, row.created_at);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await Database.getInstance().query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return new User(row.id, row.email, row.created_at);
  }

  async save(user: User): Promise<User> {
    const result = await Database.getInstance().query(
      'INSERT INTO users (id, email, created_at) VALUES ($1, $2, $3) RETURNING *',
      [user.id, user.email, user.createdAt]
    );

    const row = result.rows[0];
    return new User(row.id, row.email, row.created_at);
  }
}

