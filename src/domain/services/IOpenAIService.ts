export interface IOpenAIService {
  generateResponse(question: string): Promise<{ answer: string; tokensUsed: number }>;
}

