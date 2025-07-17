import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtBlacklistGuard } from './jwt-blacklist.guard';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly blacklistGuard: JwtBlacklistGuard) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First check if the token is blacklisted
    await this.blacklistGuard.canActivate(context);
    
    // Then proceed with the standard JWT validation
    return super.canActivate(context) as Promise<boolean>;
  }
}