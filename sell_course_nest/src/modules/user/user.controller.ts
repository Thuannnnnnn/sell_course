import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/updateProfile.dto';

@Controller('api')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('/users')
  async getAll() {
    return this.userService.getAllUser();
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
