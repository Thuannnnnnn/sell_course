import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { LoginRequestDto } from './dto/loginRequest.dto';
import { LoginResponseDto } from './dto/loginResponse.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
// import { JwtStrategy } from './strategies/jwt.strategy';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MailService } from '../../utilities/mail.service';
import { EmailVerification } from '../email_verifications/entities/email_verifications.entity';
import { OAuthRequestDto } from './dto/authRequest.dto';
import { JwtService } from '@nestjs/jwt';
import { azureUpload } from 'src/utilities/azure.service';
@Injectable()
export class authService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(EmailVerification)
    private emailVerifycationRepository: Repository<EmailVerification>,
    private readonly mailService: MailService,
    private jwtService: JwtService,
  ) {}

  async verifyEmail(email: string, lang: string) {
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
    const token = this.jwtService.sign({ email }, { expiresIn: '2d' });
    const emailVerify = this.emailVerifycationRepository.create({
      id: uuidv4(),
      email: email,
      token: token,
      expiredAt: new Date(Date.now() + 1000 * 60 * 60),
      createdAt: new Date(),
    });

    await this.emailVerifycationRepository.save(emailVerify);

    const subject = 'Verify your email';
    const content = `
      <p>Dear User,</p>
      <p>Thank you for registering with us. Please click the link below to verify your email address:</p>
      <p><a href="http://localhost:3000/${lang}/auth/signUp/info?token=${token}" target="_blank">Verify Email</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best regards,</p>
      <p>Redflag GoldenStart</p>
    `;
    this.mailService.sendSimpleEmail(email, subject, content);
    throw new HttpException('Send mail successfully', HttpStatus.OK);
  }

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const decoded = this.jwtService.decode(createUserDto.token);
    if (decoded.email !== createUserDto.email) {
      throw new HttpException(
        'Token email does not match',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!createUserDto) {
      throw new HttpException(
        'create User data not found',
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
      role: 'CUSTOMER',
      isOAuth: false,
    });

    if (!newUser) {
      throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }

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

    throw new HttpException(userResponse, HttpStatus.CREATED);
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
      role: 'CUSTOMER',
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

  async validateEmailForgot(email: string, lang: string) {
    const user = await this.userRepository.findOne({ where: { email } }); // Ensure await is used
    if (!user) {
      throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
    }
    console.log(email);
    const token = this.jwtService.sign({ email }, { expiresIn: '1h' });
    const subject = 'Password Reset Request';
    const content = `
      <p>Dear ${email},</p>
      <p>We received a request to reset your password. Please click the link below to proceed:</p>
      <p><a href="http://localhost:3000/${lang}/auth/reset-password?token=${token}&email=${email}" target="_blank">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best regards,</p>
      <p>Redflag GoldenStart Team</p>
    `;
    await this.mailService.sendSimpleEmail(email, subject, content); // Ensure email is only sent if user exists
    return {
      message: 'Password reset email sent successfully',
      statusCode: HttpStatus.OK,
    };
  }

  async forgotPw(email: string, password: string, token: string) {
    try {
      if (!token) {
        throw new HttpException('No token provided', HttpStatus.BAD_REQUEST);
      }
      console.log('Received Token:', token);
      let decoded;
      try {
        decoded = this.jwtService.verify(token);
      } catch {
        throw new HttpException(
          'Token invalid or expired',
          HttpStatus.BAD_REQUEST,
        );
      }
      console.log('Decoded Token:', decoded);
      console.log('Received email:', email);
      console.log('Token email:', decoded.email);
      // Normalize email comparison (trim + lowercase)
      if (decoded.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
        throw new HttpException(
          'Token email does not match',
          HttpStatus.BAD_REQUEST,
        );
      }
      // Check if user exists
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      // Hash new password
      const newPassword = await bcrypt.hash(password, 10);
      // Update user's password
      const result = await this.userRepository.update(
        { email },
        { password: newPassword },
      );
      if (result.affected === 0) {
        throw new HttpException(
          'Failed to update password',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return { message: 'Password reset successfully' };
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
}
