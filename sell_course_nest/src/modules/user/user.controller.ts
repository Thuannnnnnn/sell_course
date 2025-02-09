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
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserDto } from './dto/updateProfile.dto';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
@Controller('api')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('/admin/user/view_user')
  async getAllUsers() {
    return this.userService.findAll();
  }
  @UseGuards(JwtAuthGuard)
  @Get('/users/:id')
  async getUserById(@Param('id') userId: string) {
    return this.userService.findById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/users/user')
  async findUserById(@Req() req): Promise<any> {
    const email = req.user.email;
    console.log('Fetching user with email:', email);

    const user = await this.userService.getUserEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Put('/users/user')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUser(
    @Req() req: any,
    @Body() updateData: Partial<UserDto>,
    @UploadedFile() avatarFile?: Express.Multer.File,
  ): Promise<UserDto | null> {
    console.log('Authenticated User:', req.user);
    const { email, username } = req.user;

    if (!req.user || !req.user.email || !username) {
      throw new UnauthorizedException(
        'User not authenticated or missing required information.',
      );
    }

    console.log('Received update request:', { email, updateData, avatarFile });

    if (!Object.keys(updateData).length && !avatarFile) {
      throw new BadRequestException('No data provided for update.');
    }

    try {
      const updatedUser = await this.userService.updateUserById(
        email,
        updateData,
        avatarFile,
      );

      if (!updatedUser) {
        throw new UnauthorizedException(
          'User not found or not authorized to update this profile.',
        );
      }

      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new BadRequestException(
        (error as any).message || 'An error occurred while updating the user.',
      );
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('/users/user/change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
  ) {
    console.log('Received changePassword request:', {
      username: req.user.username,
      email: req.user.email,
    });
    if (!req.user || !req.user.username || !req.user.email) {
      throw new UnauthorizedException('User not authenticated');
    }

    const email = req.user.email;
    console.log('Found email:', email);

    return this.userService.changePassword(
      email,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
      changePasswordDto.confirmPassword,
    );
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

  // // Change Password
  // @UseGuards(AuthGuard('jwt'))
  // @Put('/users/user/change-password')
  // async changePassword(
  //   @Body() changePasswordDto: ChangePasswordDto,
  //   @Req() req,
  // ) {
  //   if (!req.user || !req.user.username) {
  //     throw new UnauthorizedException('No user found');
  //   }
  //   const email = req.user.email;
  //   return this.userService.changePassword(
  //     email,
  //     changePasswordDto.currentPassword,
  //     changePasswordDto.newPassword,
  //     changePasswordDto.confirmPassword,
  //   );
  // }

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

  @UseGuards(JwtAuthGuard)
  @Get('/users/profile')
  async getMe(@Req() req: any) {
    try {
      console.log('Getting user profile for:', req.user);
      if (!req.user || !req.user.email) {
        throw new UnauthorizedException('User not authenticated');
      }

      const user = await this.userService.getUserEmail(req.user.email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        status: HttpStatus.OK,
        message: 'Get user profile successfully',
        data: user,
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get user profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
