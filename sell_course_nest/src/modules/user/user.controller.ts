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
import { CreateUserDto } from './dto/createUser.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserDto } from './dto/updateProfile.dto';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
@Controller('api')
export class UserController {
  constructor(private readonly userService: UserService) { }
  @Get('/admin/user/view_user')
  async getAllUsers() {
    return this.userService.findAll();
  }
  /*
   * @UseGuards(JwtAuthGuard)
   * @Get('/users/:id')
   * async getUserById(@Param('id') userId: string) {
   *   return this.userService.findById(userId);
   * }
   */

  @UseGuards(JwtAuthGuard)
  @Get('/users/user')
  async findUserById(@Req() req): Promise<any> {
    const user_id = req.user.user_id;
    console.log('Fetching user with ID:', user_id);

    const user = await this.userService.getUserById(user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('/users/user')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUser(
    @Req() req: any,
    @Body() updateData: Partial<UserDto>,
    @UploadedFile() avatarFile?: Express.Multer.File,
  ): Promise<UserDto | null> {
    console.log('Authenticated User:', req.user);
    const { user_id, username } = req.user;

    if (!req.user || !req.user.user_id || !username) {
      throw new UnauthorizedException(
        'User not authenticated or missing required information.',
      );
    }

    console.log('Received update request:', {
      user_id,
      updateData,
      avatarFile,
    });

    if (!Object.keys(updateData).length && !avatarFile) {
      throw new BadRequestException('No data provided for update.');
    }

    try {
      const updatedUser = await this.userService.updateUserById(
        user_id,
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
      user_id: req.user.user_id,
    });
    if (!req.user || !req.user.username || !req.user.user_id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const user_id = req.user.user_id;
    console.log('Found user ID:', user_id);

    return this.userService.changePassword(
      user_id,
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
    const user_id = req.user.user_id;
    return this.userService.getUserById(user_id);
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
      if (!req.user || !req.user.user_id) {
        throw new UnauthorizedException('User not authenticated');
      }

      const user = await this.userService.getUserById(req.user.user_id);
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

  @Post('/admin/users/create')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    try {
      const newUser = await this.userService.createUser(createUserDto);
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/users/register')
  async registerUser(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    try {
      // Set default role for public registration
      const userData = {
        ...createUserDto,
        role: createUserDto.role || 'user',
        isOAuth: false,
        isBan: false,
      };

      const newUser = await this.userService.createUser(userData);
      return newUser;
    } catch (error) {
      console.error('Error registering user:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Failed to register user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('/admin/users/delete/:id')
  async deleteUser(@Param('id') userId: string) {
    try {
      await this.userService.deleteUser(userId);
      return {
        message: 'User deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to delete user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Put('admin/users/update_user/:id')
  async updateUserAdmin(
    @Param('id') userId: string,
    @Body() updateData: Partial<UserDto>,
  ): Promise<UserDto> {
    return this.userService.updateUser(userId, updateData);
  }
  @Put('/admin/users/ban/:id')
  async banUser(
    @Param('id') userId: string,
    @Body() body: { isBan: boolean },
  ): Promise<{ message: string; user: UserDto }> {
    try {
      const updatedUser = await this.userService.banUser(userId, body.isBan);
      return {
        message: `User has been ${body.isBan ? 'banned' : 'unbanned'} successfully`,
        user: updatedUser,
      };
    } catch {
      console.error('Error banning user:');
      throw new HttpException(
        'Failed to ban/unban user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
