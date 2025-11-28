import { ChatMessage } from '../entities/ChatMessage';

export interface IChatMessageRepository {
  save(message: ChatMessage): Promise<ChatMessage>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<ChatMessage[]>;
}

