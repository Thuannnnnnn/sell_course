import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/modules/user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  static generateToken(user: User, expiresIn: string): string {
    const payload = { email: user.email, role: user.role };
    return jwt.sign(payload, process.env.JWT_SECRET || 'defaultSecret', {
      expiresIn,
    });
  }

  static generateTokenRegister(email: string, expiresIn: string): string {
    const payload = { email };
    return jwt.sign(payload, process.env.JWT_SECRET || 'defaultSecret', {
      expiresIn,
    });
  }

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'defaultSecret',
    });
  }

  async validate(payload: any) {
    return { user_id: payload.sub, email: payload.email, role: payload.role };
  }
}
