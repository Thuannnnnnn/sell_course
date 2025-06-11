import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserOtpDto } from './dto/create-user-otp.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { LoginRequestDto } from './dto/loginRequest.dto';
import { LoginResponseDto } from './dto/loginResponse.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ResetPasswordOtpDto } from './dto/reset-password-otp.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
// import { JwtStrategy } from './strategies/jwt.strategy';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MailService } from '../../utilities/mail.service';

// Import from 'otp.service' in Auth module - use Redis OTP service only
import { OtpService } from './otp.service';
import { OAuthRequestDto } from './dto/authRequest.dto';
import { JwtService } from '@nestjs/jwt';
import { azureUpload } from 'src/utilities/azure.service';
import { BlacklistService } from './blacklist.service';
@Injectable()
export class authService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly mailService: MailService,
    @Inject('OTP_SERVICE')
    private readonly otpService: OtpService,
    private jwtService: JwtService,
    private readonly blacklistService: BlacklistService,
  ) {}

  async sendEmailVerificationOtp(email: string) {
    if (!email) {
      throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
    }

    const user = await this.userRepository.findOne({
      where: { email: email },
    });

    if (user) {
      throw new HttpException(
        'Email already exists in the system',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Tạo OTP 6 số
    const otpCode = await this.otpService.createOtp(
      email,
      'email_verification',
    );

    const subject = 'Verify your email - OTP Code';
    const content = `
      <p>Dear User,</p>
      <p>Thank you for registering with us. Please use the following OTP code to verify your email address:</p>
      <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${otpCode}
      </div>
      <p>This OTP code will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best regards,</p>
      <p>Redflag GoldenStart</p>
    `;

    await this.mailService.sendSimpleEmail(email, subject, content);

    return {
      message: 'OTP sent successfully to your email',
      statusCode: HttpStatus.OK,
    };
  }

  async verifyEmailOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp_code, purpose } = verifyOtpDto;

    if (purpose !== 'email_verification') {
      throw new HttpException('Invalid purpose', HttpStatus.BAD_REQUEST);
    }

    // Kiểm tra email đã tồn tại chưa
    const user = await this.userRepository.findOne({
      where: { email: email },
    });

    if (user) {
      throw new HttpException(
        'Email already exists in the system',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verify OTP
    const isValidOtp = await this.otpService.verifyOtp(
      email,
      otp_code,
      purpose,
    );

    if (isValidOtp) {
      return {
        message:
          'Email verified successfully. You can now complete registration.',
        statusCode: HttpStatus.OK,
        verified: true,
      };
    }
  }
  async verifyEmailOtpResetPw(verifyOtpDto: VerifyOtpDto) {
    const { email, otp_code, purpose } = verifyOtpDto;

    const isValidOtp = await this.otpService.verifyOtpResetPW(
      email,
      otp_code,
      purpose,
    );

    if (isValidOtp) {
      return {
        message:
          'Email verified successfully. You can now complete registration.',
        statusCode: HttpStatus.OK,
        verified: true,
      };
    }
  }

  async registerWithOtp(
    createUserOtpDto: CreateUserOtpDto,
  ): Promise<UserResponseDto> {
    const {
      email,
      otp_code,
      username,
      password,
      avatarImg,
      gender,
      birthDay,
      phoneNumber,
    } = createUserOtpDto;

    const isValidOtp = await this.otpService.verifyOtp(
      email,
      otp_code,
      'email_verification',
    );

    if (!isValidOtp) {
      throw new HttpException('Invalid or expired OTP', HttpStatus.BAD_REQUEST);
    }

    // Kiểm tra email đã tồn tại chưa (double check)
    const existingUser = await this.userRepository.findOne({
      where: { email: email },
    });

    if (existingUser) {
      throw new HttpException(
        'Email already exists in the system',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      user_id: uuidv4(),
      email: email,
      username: username,
      avatarImg: avatarImg,
      password: hashedPassword,
      gender: gender,
      birthDay: birthDay,
      phoneNumber: phoneNumber,
      role: 'USER',
      isOAuth: false,
    });

    const savedUser = await this.userRepository.save(newUser);
    const userResponse: UserResponseDto = {
      user_id: savedUser.user_id,
      email: savedUser.email,
      username: savedUser.username,
      phoneNumber: savedUser.phoneNumber,
      avatarImg: savedUser.avatarImg,
      gender: savedUser.gender,
      birthDay: savedUser.birthDay,
      role: savedUser.role,
      createdAt: savedUser.createdAt.toISOString(),
    };

    return userResponse;
  }

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const decoded = this.jwtService.decode(createUserDto.token);
      if (
        !decoded ||
        typeof decoded !== 'object' ||
        decoded.email !== createUserDto.email
      ) {
        throw new HttpException(
          'Token email does not match or invalid token',
          HttpStatus.FORBIDDEN,
        );
      }

      if (!createUserDto) {
        throw new HttpException(
          'create User data not found',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if email already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new HttpException(
          'Email already exists in the system',
          HttpStatus.BAD_REQUEST,
        );
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = this.userRepository.create({
        user_id: uuidv4(),
        email: createUserDto.email,
        username: createUserDto.username,
        avatarImg: createUserDto.avatarImg,
        password: hashedPassword,
        gender: createUserDto.gender,
        birthDay: createUserDto.birthDay,
        phoneNumber: createUserDto.phoneNumber,
        role: 'USER',
        isOAuth: false,
      });

      const savedUser = await this.userRepository.save(newUser);
      const userResponse: UserResponseDto = {
        user_id: savedUser.user_id,
        email: savedUser.email,
        username: savedUser.username,
        phoneNumber: savedUser.phoneNumber,
        avatarImg: savedUser.avatarImg,
        gender: savedUser.gender,
        birthDay: savedUser.birthDay,
        role: savedUser.role,
        createdAt: savedUser.createdAt.toISOString(),
      };

      return userResponse;
    } catch (error) {
      console.error('Error in register:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error instanceof Error ? error.message : 'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async login(loginRequest: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: loginRequest.email },
    });
    if (!user) {
      throw new HttpException('Email not found', HttpStatus.UNAUTHORIZED);
    }
    const passwordMatch = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );
    if (!passwordMatch) {
      throw new HttpException('Invalid password22', HttpStatus.UNAUTHORIZED);
    }

    const payload = {
      user_id: user.user_id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    const loginResponse: LoginResponseDto = {
      token,
      user_id: user.user_id,
      email: user.email,
      avatarImg: user.avatarImg,
      username: user.username,
      gender: user.gender,
      birthDay: user.birthDay,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    return loginResponse;
  }

  async oauth(oAuthRequestDto: OAuthRequestDto): Promise<LoginResponseDto> {
    const { email, name, picture } = oAuthRequestDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email: email },
    });

    if (existingUser) {
      // If user exists and was registered with password (not OAuth), prevent login
      if (existingUser.isOAuth === false) {
        throw new HttpException(
          'This email is already registered with password. Please use password login.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // If user exists and has OAuth flag, generate token and return login response
      const payload = {
        user_id: existingUser.user_id,
        email: existingUser.email,
        username: existingUser.username,
        role: existingUser.role,
      };
      const token = this.jwtService.sign(payload);

      return {
        token,
        user_id: existingUser.user_id,
        email: existingUser.email,
        avatarImg: existingUser.avatarImg,
        username: existingUser.username,
        gender: existingUser.gender,
        birthDay: existingUser.birthDay,
        phoneNumber: existingUser.phoneNumber,
        role: existingUser.role,
      };
    }

    // If user doesn't exist, create new user with OAuth
    const newUser = this.userRepository.create({
      user_id: uuidv4(),
      email: email,
      username: name || email.split('@')[0],
      avatarImg: picture,
      password: null,
      isOAuth: true,
      role: 'USER',
    });

    const savedUser = await this.userRepository.save(newUser);
    const payload = {
      user_id: savedUser.user_id,
      email: savedUser.email,
      username: savedUser.username,
      role: savedUser.role,
    };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user_id: savedUser.user_id,
      email: savedUser.email,
      avatarImg: savedUser.avatarImg,
      username: savedUser.username,
      gender: savedUser.gender,
      birthDay: savedUser.birthDay,
      phoneNumber: savedUser.phoneNumber,
      role: savedUser.role,
    };
  }
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    console.log('Plain password:', pass);
    const hashedInputPassword = await bcrypt.hash(pass, 10);
    console.log('Hashed input password (new hash):', hashedInputPassword);

    console.log('Hashed password from DB:', user.password);

    const passwordMatch = await bcrypt
      .compare(pass, user.password)
      .catch(() => false);

    if (!passwordMatch) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return await azureUpload(file);
  }

  async sendPasswordResetOtp(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
    }

    // Tạo OTP 6 số cho reset password
    const otpCode = await this.otpService.createOtp(email, 'password_reset');

    const subject = 'Password Reset Request - OTP Code';
    const content = `
      <p>Dear ${email},</p>
      <p>We received a request to reset your password. Please use the following OTP code to proceed:</p>
      <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${otpCode}
      </div>
      <p>This OTP code will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best regards,</p>
      <p>Redflag GoldenStart Team</p>
    `;

    await this.mailService.sendSimpleEmail(email, subject, content);

    return {
      message: 'Password reset OTP sent successfully to your email',
      statusCode: HttpStatus.OK,
    };
  }

  async resetPasswordWithOtp(resetPasswordOtpDto: ResetPasswordOtpDto) {
    const { email, otp_code, new_password } = resetPasswordOtpDto;

    try {
      // Verify OTP
      const isValidOtp = await this.otpService.verifyOtp(
        email,
        otp_code,
        'password_reset',
      );

      if (!isValidOtp) {
        throw new HttpException(
          'Invalid or expired OTP',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if user exists
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(new_password, 10);

      // Update user's password
      const result = await this.userRepository.update(
        { email },
        { password: hashedPassword },
      );

      if (result.affected === 0) {
        throw new HttpException(
          'Failed to update password',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        message: 'Password reset successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      console.error('Error in resetPasswordWithOtp:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error instanceof Error ? error.message : 'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyEmail(email: string) {
    return await this.sendEmailVerificationOtp(email);
  }

  async validateEmailForgot(email: string) {
    return await this.sendPasswordResetOtp(email);
  }

  async verifyResetOtp(email: string, otp_code: string, purpose: string) {
    try {
      const isValid = await this.otpService.verifyOtp(email, otp_code, purpose);
      if (isValid) {
        return {
          message:
            'OTP verified successfully. You can now reset your password.',
          statusCode: HttpStatus.OK,
          verified: true,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async forgotPw(email: string, password: string, token: string) {
    try {
      // Decode token để lấy thông tin
      const decoded = this.jwtService.decode(token);
      if (!decoded || typeof decoded !== 'object' || decoded.email !== email) {
        throw new HttpException(
          'Invalid token or email mismatch',
          HttpStatus.FORBIDDEN,
        );
      }

      // Check if user exists
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Hash password mới
      const hashedPassword = await bcrypt.hash(password, 10);

      // Cập nhật password
      const result = await this.userRepository.update(
        { email: email },
        { password: hashedPassword },
      );

      if (result.affected === 0) {
        throw new HttpException(
          'Failed to update password',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Invalidate all existing tokens for this user by adding them to blacklist
      // This is a security measure to ensure that after password change, all existing sessions are invalidated
      // In a real implementation, you would need to track all active tokens for a user

      return {
        message: 'Password updated successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      console.error('Error in forgotPw:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error instanceof Error ? error.message : 'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resendOtp(resendOtpDto: ResendOtpDto) {
    const { email, purpose } = resendOtpDto;

    try {
      if (purpose === 'email_verification') {
        // Kiểm tra email chưa tồn tại
        const user = await this.userRepository.findOne({
          where: { email: email },
        });

        if (user) {
          throw new HttpException(
            'Email already exists in the system',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else if (purpose === 'password_reset') {
        // Kiểm tra email tồn tại
        const user = await this.userRepository.findOne({
          where: { email: email },
        });

        if (!user) {
          throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
        }
      } else {
        throw new HttpException('Invalid purpose', HttpStatus.BAD_REQUEST);
      }

      // Resend OTP
      const newOtpCode = await this.otpService.resendOtp(email, purpose);

      // Gửi email với OTP mới
      const subject =
        purpose === 'email_verification'
          ? 'Verify your email - New OTP Code'
          : 'Password Reset Request - New OTP Code';

      const content = `
        <p>Dear User,</p>
        <p>Here is your new OTP code:</p>
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${newOtpCode}
        </div>
        <p>This OTP code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,</p>
        <p>Redflag GoldenStart Team</p>
      `;

      await this.mailService.sendSimpleEmail(email, subject, content);

      return {
        message: 'New OTP sent successfully to your email',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      console.error('Error in resendOtp:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error instanceof Error ? error.message : 'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async logout(
    token: string,
  ): Promise<{ message: string; statusCode: number }> {
    try {
      // Decode token to get expiration time
      const decodedToken = this.jwtService.decode(token);
      if (!decodedToken || typeof decodedToken !== 'object') {
        throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
      }

      // Calculate remaining time in seconds
      const expiryTime = decodedToken.exp;
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = expiryTime - currentTime;

      if (remainingTime <= 0) {
        return {
          message: 'Token already expired',
          statusCode: HttpStatus.OK,
        };
      }

      // Add token to blacklist
      await this.blacklistService.addToBlacklist(token, remainingTime);

      return {
        message: 'Logged out successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      console.error('Error in logout:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error instanceof Error ? error.message : 'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
