import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class BlacklistService {
  constructor(@Inject('CACHE_MANAGER') private cacheManager: Cache) {}

  async addToBlacklist(token: string, expiresIn: number): Promise<void> {
    // Store the token in Redis with the same expiration as the token
    await this.cacheManager.set(`blacklist:${token}`, 'true', expiresIn);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const result = await this.cacheManager.get(`blacklist:${token}`);
    return result === 'true';
  }
}
