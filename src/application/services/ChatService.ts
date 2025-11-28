import { ChatMessage } from '../../domain/entities/ChatMessage';
import { Bundle } from '../../domain/entities/Bundle';
import { UsageTracking } from '../../domain/entities/UsageTracking';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IBundleRepository } from '../../domain/repositories/IBundleRepository';
import { IChatMessageRepository } from '../../domain/repositories/IChatMessageRepository';
import { IUsageTrackingRepository } from '../../domain/repositories/IUsageTrackingRepository';
import { IOpenAIService } from '../../domain/services/IOpenAIService';
import { QuotaExceededError } from '../../domain/errors/QuotaExceededError';
import { randomUUID } from 'crypto';
import { Database } from '../../infrastructure/database/Database';

export class ChatService {
  constructor(
    private userRepository: IUserRepository,
    private bundleRepository: IBundleRepository,
    private chatMessageRepository: IChatMessageRepository,
    private usageTrackingRepository: IUsageTrackingRepository,
    private openAIService: IOpenAIService
  ) {}

  async processChatQuestion(userId: string, question: string): Promise<ChatMessage> {
    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check monthly free quota
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let usageTracking = await this.usageTrackingRepository.findByUserIdAndMonth(
      userId,
      month,
      year
    );

    if (!usageTracking) {
      usageTracking = UsageTracking.create(userId, month, year);
      usageTracking = await this.usageTrackingRepository.save(usageTracking);
    }

    // Try to use free quota first
    if (usageTracking.hasFreeQuota) {
      // Generate response first (before transaction to avoid holding DB connection)
      const { answer, tokensUsed } = await this.openAIService.generateResponse(question);

      // Use free quota and save message atomically
      usageTracking = usageTracking.incrementFreeUsage();
      
      // Use transaction to ensure atomicity
      return await Database.transaction(async (client) => {
        // Update usage tracking
        await client.query(
          `UPDATE usage_tracking 
           SET free_messages_used = $1, last_reset_at = $2
           WHERE id = $3`,
          [usageTracking.freeMessagesUsed, usageTracking.lastResetAt, usageTracking.id]
        );

        // Save chat message
        const message = ChatMessage.create(
          randomUUID(),
          userId,
          question,
          answer,
          tokensUsed
        );

        const result = await client.query(
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

        return new ChatMessage(
          result.rows[0].id,
          result.rows[0].user_id,
          result.rows[0].question,
          result.rows[0].answer,
          result.rows[0].tokens_used,
          result.rows[0].created_at
        );
      });
    }

    // Check for active bundles
    const activeBundles = await this.bundleRepository.findActiveByUserId(userId);
    
    if (activeBundles.length === 0) {
      throw new QuotaExceededError(
        'You have exceeded your free monthly quota. Please subscribe to a bundle to continue.',
        'QUOTA_EXCEEDED',
        {
          freeQuotaUsed: usageTracking.freeMessagesUsed,
          freeQuotaLimit: 3,
          requiresSubscription: true
        }
      );
    }

    // Find bundle with latest remaining quota
    const sortedBundles = activeBundles.sort((a, b) => b.remainingQuota - a.remainingQuota);
    const bundleToUse = sortedBundles[0];

    if (!bundleToUse.canDeduct(1)) {
      throw new QuotaExceededError(
        'All your subscription bundles have exhausted their quota.',
        'BUNDLE_QUOTA_EXCEEDED',
        {
          bundles: activeBundles.map(b => ({
            id: b.id,
            tier: b.tier,
            remainingQuota: b.remainingQuota
          }))
        }
      );
    }

    // Generate response first (before transaction to avoid holding DB connection)
    const { answer, tokensUsed } = await this.openAIService.generateResponse(question);

    // Deduct from bundle and save message atomically
    const updatedBundle = bundleToUse.deduct(1);
    
    // Use transaction to ensure atomicity
    return await Database.transaction(async (client) => {
      // Update bundle
      await client.query(
        `UPDATE bundles 
         SET remaining_quota = $1
         WHERE id = $2`,
        [updatedBundle.remainingQuota, updatedBundle.id]
      );

      // Save chat message
      const message = ChatMessage.create(randomUUID(), userId, question, answer, tokensUsed);
      
      const result = await client.query(
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

      return new ChatMessage(
        result.rows[0].id,
        result.rows[0].user_id,
        result.rows[0].question,
        result.rows[0].answer,
        result.rows[0].tokens_used,
        result.rows[0].created_at
      );
    });
  }
}

