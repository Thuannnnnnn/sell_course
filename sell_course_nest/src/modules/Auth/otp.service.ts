import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import Redis from 'ioredis';

@Injectable()
export class OtpService {
  private readonly redisClient: Redis;

  constructor(@Inject('CACHE_MANAGER') private cacheManager: Cache) {
    this.redisClient = new Redis({ host: 'localhost', port: 6379 }); // kết nối tới Redis
  }

  async storeOtp(email: string, otp: string): Promise<void> {
    await this.redisClient.set(`otp:${email}`, otp, 'EX', 300); // TTL: 5 phút
  }

  async getOtp(email: string): Promise<string | null> {
    return await this.redisClient.get(`otp:${email}`);
  }

  async deleteOtp(email: string): Promise<void> {
    await this.redisClient.del(`otp:${email}`);
  }

  async getAllOtpKeys(): Promise<Record<string, string>> {
    const keys = await this.redisClient.keys('otp:*');
    const result: Record<string, string> = {};

    for (const key of keys) {
      const value = await this.redisClient.get(key);
      if (value) result[key] = value;
    }

    return result;
  }
}
