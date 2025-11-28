import { Request, Response } from 'express';
import { ChatService } from '../../application/services/ChatService';
import { QuotaExceededError } from '../../domain/errors/QuotaExceededError';

export class ChatController {
  constructor(private chatService: ChatService) {}

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const { question } = req.body;

      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Question is required and must be a non-empty string',
        });
        return;
      }

      const message = await this.chatService.processChatQuestion(userId, question.trim());

      res.status(200).json({
        id: message.id,
        question: message.question,
        answer: message.answer,
        tokensUsed: message.tokensUsed,
        createdAt: message.createdAt,
      });
    } catch (error) {
      if (error instanceof QuotaExceededError) {
        res.status(403).json({
          error: error.code,
          message: error.message,
          details: error.details,
        });
        return;
      }

      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: error.message,
        });
        return;
      }

      console.error('Error processing chat message:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while processing your request',
      });
    }
  }
}

