import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OTP } from './entities/otp.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OTP)
    private otpRepository: Repository<OTP>,
  ) {}

  generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Tạo và lưu OTP mới
  async createOtp(email: string, purpose: string): Promise<string> {
    await this.otpRepository.delete({
      email,
      purpose,
      isUsed: false,
    });

    const otpCode = this.generateOtpCode();
    const now = new Date();
    const expiredAt = new Date(now.getTime() + 10 * 60 * 1000);

    const otp = this.otpRepository.create({
      id: uuidv4(),
      email,
      otp_code: otpCode,
      purpose,
      createdAt: now,
      expiredAt,
      isUsed: false,
      resendCount: 0,
    });

    await this.otpRepository.save(otp);
    return otpCode;
  }

  //verify OTP
  async verifyOtp(
    email: string,
    otpCode: string,
    purpose: string,
  ): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: {
        email,
        otp_code: otpCode,
        purpose,
        isUsed: false,
      },
    });
    if (!otp) {
      throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }
    if (new Date() > otp.expiredAt) {
      throw new HttpException('OTP has expired', HttpStatus.BAD_REQUEST);
    }
    await this.otpRepository.update(otp.id, { isUsed: true });
    return true;
  }

  // Resend OTP
  async resendOtp(email: string, purpose: string): Promise<string> {
    // Tìm OTP gần nhất
    const latestOtp = await this.otpRepository.findOne({
      where: { email, purpose },
      order: { createdAt: 'DESC' },
    });

    if (latestOtp) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (latestOtp.resendCount >= 3 && latestOtp.createdAt > oneHourAgo) {
        throw new HttpException(
          'Too many resend attempts. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      if (latestOtp.lastResendAt) {
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        if (latestOtp.lastResendAt > oneMinuteAgo) {
          throw new HttpException(
            'Please wait 1 minute before requesting another OTP',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
      }
    }

    const newOtpCode = await this.createOtp(email, purpose);

    if (latestOtp) {
      await this.otpRepository.update(latestOtp.id, {
        resendCount: latestOtp.resendCount + 1,
        lastResendAt: new Date(),
      });
    }

    return newOtpCode;
  }

  // Xóa các OTP đã hết hạn (có thể chạy định kỳ)
  async cleanupExpiredOtps(): Promise<void> {
    const now = new Date();
    await this.otpRepository
      .createQueryBuilder()
      .delete()
      .where('expired_at < :now', { now })
      .execute();
  }
}
