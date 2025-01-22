import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserDto } from './dto/userData.dto';
@Controller('api/')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('users')
  async getAll() {
    return this.userService.getAllUser();
  }

  @Get('/user/:user_id')
  async getUserById(
    @Param('user_id') user_id: string,
  ): Promise<UserDto | null> {
    return this.userService.getUserById(user_id); // Calls the service to get the user by user_id
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('user/change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
  ) {
    // Log user data to verify it's being passed correctly
    console.log('User from JWT:', req.user);

    // Ensure the user is authenticated and has a username
    if (!req.user || !req.user.username) {
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
