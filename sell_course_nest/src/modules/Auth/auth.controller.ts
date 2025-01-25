import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { authService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { LoginRequestDto } from './dto/loginRequest.dto';
import { LoginResponseDto } from './dto/loginResponse.dto';
import { OAuthRequestDto } from './dto/authRequest.dto';
import { AuthGuard } from '@nestjs/passport';
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

  @Post('verify-email')
  async verifyEmail(@Body() body: { email: string; lang: string }) {
    const { email, lang } = body;
    return await this.authService.verifyEmail(email, lang);
  }
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(
    @Body() loginRequest: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    const user = await this.authService.login(loginRequest);
    return user;
  }
  @Post('oauth')
  async oauth(@Body() oAuthRequestDto: OAuthRequestDto) {
    return await this.authService.oauth(oAuthRequestDto);
  }
}
