import { Bundle } from '../entities/Bundle';

export interface IBundleRepository {
  findActiveByUserId(userId: string): Promise<Bundle[]>;
  findLatestActiveByUserId(userId: string): Promise<Bundle | null>;
  save(bundle: Bundle): Promise<Bundle>;
  update(bundle: Bundle): Promise<Bundle>;
}

