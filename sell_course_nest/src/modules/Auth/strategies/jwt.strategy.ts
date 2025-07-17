import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';
import { BlacklistService } from '../blacklist.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly blacklistService: BlacklistService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: any) {
    // Extract token from authorization header
    const token = request.headers.authorization?.split(' ')[1];
    
    // Check if token is blacklisted
    if (token && await this.blacklistService.isBlacklisted(token)) {
      throw new UnauthorizedException('Token has been invalidated');
    }
    
    return {
      user_id: payload.user_id,
      username: payload.username,
      email: payload.email,
      permissions: payload.permissions,
    };
  }
}
