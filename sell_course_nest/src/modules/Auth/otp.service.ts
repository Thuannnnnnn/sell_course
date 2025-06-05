import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Cache } from 'cache-manager';
import Redis from 'ioredis';

@Injectable()
export class OtpService {
  private readonly redisClient: Redis;

  constructor(@Inject('CACHE_MANAGER') private cacheManager: Cache) {
    this.redisClient = new Redis({ host: 'localhost', port: 6379 }); // kết nối tới Redis
  }

  generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Create and store a new OTP
  async createOtp(email: string, purpose: string): Promise<string> {
    // Delete any existing OTP for this email and purpose
    const key = `otp:${email}:${purpose}`;
    await this.redisClient.del(key);

    // Generate new OTP
    const otpCode = this.generateOtpCode();

    // Store OTP with metadata
    const otpData = {
      code: otpCode,
      createdAt: Date.now(),
      isUsed: false,
      resendCount: 0,
      lastResendAt: null,
    };

    // Set TTL to 10 minutes (600 seconds)
    await this.redisClient.set(key, JSON.stringify(otpData), 'EX', 600);

    return otpCode;
  }

  // Verify OTP
  async verifyOtp(
    email: string,
    otpCode: string,
    purpose: string,
  ): Promise<boolean> {
    const key = `otp:${email}:${purpose}`;
    const otpDataStr = await this.redisClient.get(key);

    if (!otpDataStr) {
      throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }

    const otpData = JSON.parse(otpDataStr);

    if (otpData.isUsed) {
      throw new HttpException(
        'OTP has already been used',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (otpData.code !== otpCode) {
      throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }

    // Check if OTP is expired (10 minutes)
    const now = Date.now();
    if (now - otpData.createdAt > 10 * 60 * 1000) {
      throw new HttpException('OTP has expired', HttpStatus.BAD_REQUEST);
    }

    // Mark OTP as used
    otpData.isUsed = true;
    await this.redisClient.set(key, JSON.stringify(otpData), 'EX', 600);

    return true;
  }

  // Resend OTP
  async resendOtp(email: string, purpose: string): Promise<string> {
    const key = `otp:${email}:${purpose}`;
    const otpDataStr = await this.redisClient.get(key);

    if (otpDataStr) {
      const otpData = JSON.parse(otpDataStr);
      const now = Date.now();

      // Check if too many resend attempts (max 3 per hour)
      if (
        otpData.resendCount >= 3 &&
        now - otpData.createdAt < 60 * 60 * 1000
      ) {
        throw new HttpException(
          'Too many resend attempts. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Check if last resend was less than 1 minute ago
      if (otpData.lastResendAt && now - otpData.lastResendAt < 60 * 1000) {
        throw new HttpException(
          'Please wait 1 minute before requesting another OTP',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    // Generate new OTP
    const newOtpCode = this.generateOtpCode();

    // Create new OTP data or update existing
    const otpData = otpDataStr
      ? {
          ...JSON.parse(otpDataStr),
          code: newOtpCode,
          isUsed: false,
          resendCount: (JSON.parse(otpDataStr).resendCount || 0) + 1,
          lastResendAt: Date.now(),
        }
      : {
          code: newOtpCode,
          createdAt: Date.now(),
          isUsed: false,
          resendCount: 0,
          lastResendAt: Date.now(),
        };

    // Store with TTL of 10 minutes
    await this.redisClient.set(key, JSON.stringify(otpData), 'EX', 600);

    return newOtpCode;
  }

  // Helper methods for compatibility with the original service
  async storeOtp(email: string, otp: string): Promise<void> {
    await this.redisClient.set(`otp:${email}`, otp, 'EX', 300); // TTL: 5 minutes
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

  // Cleanup expired OTPs (can be run periodically)
  async cleanupExpiredOtps(): Promise<void> {
    // Redis automatically removes expired keys, so this is a no-op
    // But we keep it for API compatibility with the database version
  }
}
