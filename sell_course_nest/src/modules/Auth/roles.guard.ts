import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard extends JwtAuthGuard {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const requiredRole = this.reflector.get<string>(
      'role',
      context.getHandler(),
    );
    if (!requiredRole) {
      return true; // Nếu không yêu cầu role, cho phép truy cập
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // user từ JWT payload

    if (!user || user.role !== requiredRole) {
      throw new ForbiddenException('You do not have the required permissions');
    }

    return true;
  }
}
