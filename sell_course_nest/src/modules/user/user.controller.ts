import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Put,
  Req,
  UnauthorizedException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { UpdateProfileDto } from './dto/updateProfile.dto';
@Controller('api')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('/admin/user/view_user')
  async getAllUsers() {
    return this.userService.findAll();
  }
  @Get(':id')
  async getUserById(@Param('id') userId: string) {
    return this.userService.findById(userId);
  }

  @Post('/admin/users/assign_permissions/:id')
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
  async get(@Req() req) {
    const email = req.user.email;
    return this.userService.getUser(email);
  }

  // Change Password
  @UseGuards(AuthGuard('jwt'))
  @Put('/users/user/change-password')
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
  @Put('/users/user/profile')
  async updateProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const email = req.user.email;
    return this.userService.updateProfile(email, updateProfileDto);
  }

  @Delete('/admin/users/remove_permission/:userId/:permissionId')
  async removePermission(
    @Param('userId') userId: string,
    @Param('permissionId') permissionId: number,
  ) {
    try {
      const updatedUser = await this.userService.removePermission(
        userId,
        permissionId,
      );
      return {
        message: 'Permission removed successfully',
        user: updatedUser,
      };
    } catch {
      throw new HttpException(
        'Failed to remove permission',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
