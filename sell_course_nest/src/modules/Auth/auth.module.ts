import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { EmailVerification } from '../email_verifications/entities/email_verifications.entity';
import { OTP } from '../otp/entities/otp.entity';
import { authService } from './auth.service';
import { authController } from './auth.controller';
import { OtpService } from '../otp/otp.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from 'src/utilities/mail.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './strategies/jwt.strategy';
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', // SMTP server
        port: 587, // Cổng SMTP
        secure: false, // false cho STARTTLS
        auth: {
          user: 'sdnmmagr5@gmail.com', // Email của bạn
          pass: 'gogm mzdj yssh roiv', // Mật khẩu ứng dụng
        },
      },
      defaults: {
        from: '"No Reply" <sdnmmagr5@gmail.com>', // Email mặc định khi gửi
      },
    }),
    TypeOrmModule.forFeature([User, EmailVerification, OTP]),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '2h' },
    }),
  ],
  providers: [authService, OtpService, MailService, LocalStrategy, JwtStrategy],
  controllers: [authController],
  exports: [JwtModule, authService],
})
export class authModule {}
