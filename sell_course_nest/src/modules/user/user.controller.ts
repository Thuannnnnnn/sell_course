import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserDto } from './dto/userData.dto';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('api/')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('users')
  async getAll() {
    return this.userService.getAllUser();
  }

  // Define a new route to fetch user by ID
  @Get('user/:user_id')
  async getUserById(@Param('user_id') user_id: string): Promise<any> {
    console.log('Fetching user with ID:', user_id); // Debug để xem user_id có chính xác không
    const user = await this.userService.getUserById(user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Define a new route to update user profile
  @UseGuards(AuthGuard('jwt'))
  @Put('/user')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUser(
    @Req() req: any,
    @Body() updateData: Partial<UserDto>,
    @UploadedFile() avatarFile?: Express.Multer.File,
  ): Promise<UserDto | null> {
    console.log('Authenticated User:', req.user);
    const { email, username } = req.user;

    if (!email || !username) {
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

  // Define a new route to change user password
  @UseGuards(AuthGuard('jwt'))
  @Put('user/change-password')
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
}
