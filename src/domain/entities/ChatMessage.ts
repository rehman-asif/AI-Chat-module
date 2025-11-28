export class ChatMessage {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly question: string,
    public readonly answer: string,
    public readonly tokensUsed: number,
    public readonly createdAt: Date
  ) {}

  static create(
    id: string,
    userId: string,
    question: string,
    answer: string,
    tokensUsed: number
  ): ChatMessage {
    return new ChatMessage(id, userId, question, answer, tokensUsed, new Date());
  }
}

