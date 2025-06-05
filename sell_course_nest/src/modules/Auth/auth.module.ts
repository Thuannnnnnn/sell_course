import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

import { OTP } from '../otp/entities/otp.entity';
import { authService } from './auth.service';
import { authController } from './auth.controller';
import { OtpService as DatabaseOtpService } from '../otp/otp.service';
import { OtpService as RedisOtpService } from './otp.service';
import { BlacklistService } from './blacklist.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from 'src/utilities/mail.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtBlacklistGuard } from './guards/jwt-blacklist.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'sdnmmagr5@gmail.com',
          pass: 'gogm mzdj yssh roiv',
        },
      },
      defaults: {
        from: '"No Reply" <sdnmmagr5@gmail.com>',
      },
    }),
    TypeOrmModule.forFeature([User, OTP]),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '2h' },
    }),
  ],
  providers: [
    authService, 
    MailService, 
    LocalStrategy, 
    JwtStrategy, 
    BlacklistService,
    JwtBlacklistGuard,
    JwtAuthGuard,
    {
      provide: 'OTP_SERVICE',
      useClass: process.env.USE_REDIS === 'true' ? RedisOtpService : DatabaseOtpService
    },
    DatabaseOtpService,
    RedisOtpService
  ],
  controllers: [authController],
  exports: [JwtModule, authService, BlacklistService, JwtBlacklistGuard, JwtAuthGuard],
})
export class authModule {}
