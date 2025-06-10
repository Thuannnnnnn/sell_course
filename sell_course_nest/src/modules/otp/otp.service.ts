import { Injectable, Logger } from '@nestjs/common';

/**
 * @deprecated This service is deprecated and no longer used.
 * The application now uses RedisOtpService exclusively from the Auth module.
 * All OTP operations now use Redis instead of database storage.
 */
@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor() {
    this.logger.warn(
      'DatabaseOtpService is deprecated. The application now uses Redis for OTP operations.',
    );
  }

  /**
   * @deprecated Use RedisOtpService instead
   */
  generateOtpCode(): string {
    this.logger.warn('Method called on deprecated service');
    return '000000';
  }

  /**
   * @deprecated Use RedisOtpService instead
   */
  async createOtp(email: string, purpose: string): Promise<string> {
    this.logger.warn('Method called on deprecated service');
    return '000000';
  }

  /**
   * @deprecated Use RedisOtpService instead
   */
  async verifyOtp(
    email: string,
    otpCode: string,
    purpose: string,
  ): Promise<boolean> {
    this.logger.warn('Method called on deprecated service');
    return false;
  }

  /**
   * @deprecated Use RedisOtpService instead
   */
  async resendOtp(email: string, purpose: string): Promise<string> {
    this.logger.warn('Method called on deprecated service');
    return '000000';
  }

  /**
   * @deprecated Use RedisOtpService instead
   */
  async cleanupExpiredOtps(): Promise<void> {
    this.logger.warn('Method called on deprecated service');
  }
}
