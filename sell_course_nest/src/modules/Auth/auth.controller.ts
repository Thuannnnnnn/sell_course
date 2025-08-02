import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { authService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserOtpDto } from './dto/create-user-otp.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { LoginRequestDto } from './dto/loginRequest.dto';
import { LoginResponseDto } from './dto/loginResponse.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { OAuthRequestDto } from './dto/authRequest.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ResetPasswordOtpDto } from './dto/reset-password-otp.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
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
    const { email } = body;
    return await this.authService.verifyEmail(email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.authService.verifyEmailOtp(verifyOtpDto);
  }
  @Post('verify-otp-reset-pw')
  async verifyOtpResetPW(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.authService.verifyEmailOtpResetPw(verifyOtpDto);
  }

  @Post('register-with-otp')
  async registerWithOtp(
    @Body() createUserOtpDto: CreateUserOtpDto,
  ): Promise<UserResponseDto> {
    return await this.authService.registerWithOtp(createUserOtpDto);
  }

  @Post('resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return await this.authService.resendOtp(resendOtpDto);
  }
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(
    @Body() loginRequest: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    const user = await this.authService.login(loginRequest);
    return user;
  }
  @Post('callback/oauth')
  async oauth(@Body() oAuthRequestDto: OAuthRequestDto) {
    return await this.authService.oauth(oAuthRequestDto);
  }
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    const url = await this.authService.uploadFile(file);
    return { url };
  }
  @Post('forgot-verify-email')
  async forgotVerifyEmail(@Body() body: { email: string }) {
    if (!body.email) {
      throw new HttpException(
        'Bad Request: Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      await this.authService.validateEmailForgot(body.email);
      return { message: 'Email sent successfully', statusCode: HttpStatus.OK };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('reset-password')
  async forgotPasswordInfo(
    @Body() body: { token: string; email: string; password: string },
  ) {
    if (!body.token || !body.email || !body.password) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
    return await this.authService.forgotPw(
      body.email,
      body.password,
      body.token,
    );
  }

  @Post('reset-password-with-otp')
  async resetPasswordWithOtp(@Body() resetPasswordOtpDto: ResetPasswordOtpDto) {
    return await this.authService.resetPasswordWithOtp(resetPasswordOtpDto);
  }

  @Post('verify-reset-otp')
  async verifyResetOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const { email, otp_code, purpose } = verifyOtpDto;

    if (purpose !== 'password_reset') {
      throw new HttpException(
        'Invalid purpose for password reset',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.authService.verifyResetOtp(email, otp_code, purpose);
  }

  @Post('logout')
  async logout(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException('Invalid token format', HttpStatus.BAD_REQUEST);
    }

    const token = authHeader.split(' ')[1];
    return await this.authService.logout(token);
  }

  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<LoginResponseDto> {
    return await this.authService.refreshToken(refreshTokenDto.refreshToken);
  }
}
