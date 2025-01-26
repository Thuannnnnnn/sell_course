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

  @UseGuards(AuthGuard('jwt'))
  @Get('/user')
  async get(@Request() req) {
    const email = req.user.email;
    return this.userService.getUser(email);
  }

  // Change Password
  @UseGuards(AuthGuard('jwt'))
  @Put('/user/change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
  ) {
    if (!req.user || !req.user.username) {
      throw new UnauthorizedException('No user found');
    }
    const email = req.user.email;
    return this.userService.changePassword(
      email,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
      changePasswordDto.confirmPassword,
    );
  }
  @UseGuards(AuthGuard('jwt'))
  @Put('/user/profile')
  async updateProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    console.log(req.user);
    const email = req.user.email;
    return this.userService.updateProfile(email, updateProfileDto);
  }
}
