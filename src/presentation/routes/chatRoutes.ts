import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { ChatService } from '../../application/services/ChatService';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { BundleRepository } from '../../infrastructure/repositories/BundleRepository';
import { ChatMessageRepository } from '../../infrastructure/repositories/ChatMessageRepository';
import { UsageTrackingRepository } from '../../infrastructure/repositories/UsageTrackingRepository';
import { MockOpenAIService } from '../../infrastructure/services/MockOpenAIService';

const router = Router();

// Initialize dependencies
const userRepository = new UserRepository();
const bundleRepository = new BundleRepository();
const chatMessageRepository = new ChatMessageRepository();
const usageTrackingRepository = new UsageTrackingRepository();
const openAIService = new MockOpenAIService();

const chatService = new ChatService(
  userRepository,
  bundleRepository,
  chatMessageRepository,
  usageTrackingRepository,
  openAIService
);

const chatController = new ChatController(chatService);

router.post('/users/:userId/chat', (req, res) => chatController.sendMessage(req, res));

export default router;

