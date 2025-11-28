import { ChatMessage } from '../../domain/entities/ChatMessage';
import { IChatMessageRepository } from '../../domain/repositories/IChatMessageRepository';
import { Database } from '../database/Database';

export class ChatMessageRepository implements IChatMessageRepository {
  async save(message: ChatMessage): Promise<ChatMessage> {
    const result = await Database.getInstance().query(
      `INSERT INTO chat_messages (id, user_id, question, answer, tokens_used, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        message.id,
        message.userId,
        message.question,
        message.answer,
        message.tokensUsed,
        message.createdAt,
      ]
    );

    return this.mapRowToMessage(result.rows[0]);
  }

  async findByUserId(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatMessage[]> {
    const result = await Database.getInstance().query(
      `SELECT * FROM chat_messages 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows.map((row) => this.mapRowToMessage(row));
  }

  private mapRowToMessage(row: any): ChatMessage {
    return new ChatMessage(
      row.id,
      row.user_id,
      row.question,
      row.answer,
      row.tokens_used,
      row.created_at
    );
  }
}

