import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret_key',
    });
  }

  async validate(payload: any) {
    // Debug: In ra payload để kiểm tra dữ liệu JWT
    console.log('Decoded JWT Payload:', payload);

    // Trả về thông tin người dùng vào request.user
    return {
      userId: payload.sub, // ID người dùng
      email: payload.email, // Email người dùng
      permissions: payload.permissions, // Quyền người dùng
    };
  }
}
