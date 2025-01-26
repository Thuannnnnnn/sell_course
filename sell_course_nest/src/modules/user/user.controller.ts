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
  @UseGuards(AuthGuard('jwt')) // Sử dụng JWT Guard để xác thực người dùng
  @Put('/user')
  @UseInterceptors(FileInterceptor('avatar')) // Xử lý upload file cho avatar
  async updateUser(
    @Req() req: any,
    @Body() updateData: Partial<UserDto>, // Dữ liệu cập nhật
    @UploadedFile() avatarFile?: Express.Multer.File, // File avatar (nếu có)
  ): Promise<UserDto | null> {
    // Kiểm tra thông tin người dùng đã được xác thực
    console.log('Authenticated User:', req.user); // In thông tin người dùng ra để kiểm tra
    const { email, username } = req.user;

    if (!email || !username) {
      throw new UnauthorizedException(
        'User not authenticated or missing required information.',
      );
    }

    // In dữ liệu yêu cầu cập nhật để kiểm tra
    console.log('Received update request:', { email, updateData, avatarFile });

    // Kiểm tra nếu không có dữ liệu để cập nhật
    if (!Object.keys(updateData).length && !avatarFile) {
      throw new BadRequestException('No data provided for update.');
    }

    try {
      // Cập nhật thông tin người dùng trong cơ sở dữ liệu
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

      // Trả về thông tin người dùng sau khi cập nhật
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
    // Log user data to verify it's being passed correctly
    console.log('Received changePassword request:', {
      username: req.user.username,
      email: req.user.email,
    });
    // Ensure the user is authenticated and has a username
    if (!req.user || !req.user.username || !req.user.email) {
      throw new UnauthorizedException('User not authenticated');
    }

    const email = req.user.email;
    console.log('Found email:', email);

    // Delegate to the service method
    return this.userService.changePassword(
      email,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
      changePasswordDto.confirmPassword,
    );
  }
}
