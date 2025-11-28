export class BundleNotFoundError extends Error {
  constructor(message: string = 'No active subscription bundle found') {
    super(message);
    this.name = 'BundleNotFoundError';
  }
}

