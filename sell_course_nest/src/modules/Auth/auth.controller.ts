import { Controller, Post, Body } from '@nestjs/common';
import { authService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('api/auth')
export class authController {
  constructor(private readonly authService: authService) {}

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.authService.register(createUserDto);
    return user;
  }
}
