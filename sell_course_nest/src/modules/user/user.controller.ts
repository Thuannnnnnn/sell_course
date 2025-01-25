import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
// import { Permissions } from '../permission/permission.enum';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('/view_user')
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Get(':id')
  async getUserById(@Param('id') userId: string) {
    return this.userService.findById(userId);
  }

  @Post('assign_permissions/:id')
  async addPermissionsToUser(
    @Param('id') userId: string,
    @Body() body: { permissionIds: number[] },
  ) {
    return this.userService.addPermissions(userId, body.permissionIds);
  }
  @Delete(':id/permissions/:permissionId')
  async removePermissionFromUser(
    @Param('id') userId: string,
    @Param('permissionId') permissionId: number,
  ) {
    return this.userService.removePermission(userId, permissionId);
  }
}
