export class QuotaExceededError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'QUOTA_EXCEEDED',
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

