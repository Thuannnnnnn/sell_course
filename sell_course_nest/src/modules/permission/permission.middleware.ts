import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionRepository: TreeRepository<Permission>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl.startsWith('/api/auth/')) {
      console.log('[DEBUG] Skipping middleware for auth routes');
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[DEBUG] Missing or invalid authorization header');
      throw new UnauthorizedException('Invalid token');
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = this.jwtService.verify(token);
      console.log('[DEBUG] Token payload:', payload);
    } catch {
      console.error('[DEBUG] Token verification failed');
      throw new UnauthorizedException('Invalid token');
    }

    const { iat, exp, user_id: userId } = payload;

    if (!iat || !exp || !userId) {
      console.error('[DEBUG] Invalid token payload - missing required fields');
      throw new UnauthorizedException('Invalid token');
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp < iat || currentTimestamp > exp) {
      console.error('[DEBUG] Token is expired or not yet valid');
      throw new UnauthorizedException('Token has expired or is not yet valid');
    }

    console.log('[DEBUG] User ID from token:', userId);

    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['permissions'],
    });

    if (!user) {
      console.error('[DEBUG] User not found for user_id:', userId);
      throw new UnauthorizedException('User not found');
    }

    console.log('[DEBUG] Retrieved user:', user);

    let requiredPermissionCode = req.originalUrl.split('/').slice(2)[0];
    if (req.originalUrl.startsWith('/api/')) {
      requiredPermissionCode = req.originalUrl.split('/').slice(4)[0];
    }

    console.log('[DEBUG] Required permission code:', requiredPermissionCode);

    if (!requiredPermissionCode) {
      console.log('[DEBUG] No required permission code detected - skipping');
      return next();
    }

    const hasPermission = await this.checkPermission(
      user.permissions,
      requiredPermissionCode,
    );

    console.log('[DEBUG] Permission check result:', hasPermission);

    if (!hasPermission) {
      console.error(
        `[DEBUG] User does not have the required permission: ${requiredPermissionCode}`,
      );
      throw new ForbiddenException(
        'You do not have the required permission for this action',
      );
    }

    req['user'] = user;
    next();
  }

  private async checkPermission(
    userPermissions: Permission[],
    requiredPermissionCode: string,
  ): Promise<boolean> {
    console.log('[DEBUG] Checking permissions for:', {
      userPermissions,
      requiredPermissionCode,
    });

    if (!userPermissions || userPermissions.length === 0) {
      console.log('[DEBUG] User has no permissions');
      return false;
    }

    const permission = await this.permissionRepository.findOne({
      where: { code: requiredPermissionCode },
    });

    console.log('[DEBUG] Required permission from database:', permission);

    if (!permission) {
      console.error('[DEBUG] Required permission not found in database');
      return false;
    }

    const hasDirectPermission = userPermissions.some(
      (userPermission) => Number(userPermission.id) === Number(permission.id),
    );

    console.log('[DEBUG] User has direct permission:', hasDirectPermission);

    if (hasDirectPermission) {
      return true;
    }

    const ancestors = await this.permissionRepository.findAncestors(permission);
    console.log('[DEBUG] Ancestors of required permission:', ancestors);

    const hasParentPermission = ancestors.some((ancestor) =>
      userPermissions.some(
        (userPermission) => Number(userPermission.id) === Number(ancestor.id),
      ),
    );

    console.log('[DEBUG] User has parent permission:', hasParentPermission);

    return hasParentPermission;
  }
}
