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
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid token');
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const { iat, exp, user_id: userId } = payload;

    if (!iat || !exp || !userId) {
      throw new UnauthorizedException('Invalid token');
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp < iat || currentTimestamp > exp) {
      throw new UnauthorizedException('Token has expired or is not yet valid');
    }

    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['permissions'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    let requiredPermissionCode = req.originalUrl.split('/').slice(2)[0];
    if (req.originalUrl.startsWith('/api/')) {
      requiredPermissionCode = req.originalUrl.split('/').slice(4)[0];
    }

    if (!requiredPermissionCode) {
      return next();
    }

    const hasPermission = await this.checkPermission(
      user.permissions,
      requiredPermissionCode,
    );

    if (!hasPermission) {
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
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }

    const permission = await this.permissionRepository.findOne({
      where: { code: requiredPermissionCode },
    });

    if (!permission) {
      return false;
    }

    const hasDirectPermission = userPermissions.some(
      (userPermission) => Number(userPermission.id) === Number(permission.id),
    );

    if (hasDirectPermission) {
      return true;
    }

    const ancestors = await this.permissionRepository.findAncestors(permission);

    const hasParentPermission = ancestors.some((ancestor) =>
      userPermissions.some(
        (userPermission) => Number(userPermission.id) === Number(ancestor.id),
      ),
    );

    return hasParentPermission;
  }
}
