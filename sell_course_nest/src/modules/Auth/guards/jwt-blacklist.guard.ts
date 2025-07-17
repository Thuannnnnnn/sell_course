import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { BlacklistService } from '../blacklist.service';

@Injectable()
export class JwtBlacklistGuard implements CanActivate {
  constructor(private readonly blacklistService: BlacklistService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return true; // Let the JWT guard handle this case
    }

    const token = authHeader.split(' ')[1];
    const isBlacklisted = await this.blacklistService.isBlacklisted(token);

    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been invalidated');
    }

    return true;
  }
}