import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OTP } from './entities/otp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OTP])],
  exports: [TypeOrmModule],
})
export class OtpModule {}
