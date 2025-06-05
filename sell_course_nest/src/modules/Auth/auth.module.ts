import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

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
  providers: [authService, MailService, LocalStrategy, JwtStrategy, OtpService],
  controllers: [authController],
  exports: [JwtModule, authService],
})
export class authModule {}
