import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { LoginRequestDto } from './dto/loginRequest.dto';
import { LoginResponseDto } from './dto/loginResponse.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { JwtStrategy } from './strategies/jwt.strategy';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MailService } from '../../utilities/mail.service';
import { EmailVerification } from '../email_verifications/entities/email_verifications.entity';
@Injectable()
export class authService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(EmailVerification)
    private emailVerifycationRepository: Repository<EmailVerification>,
    private readonly mailService: MailService,
  ) {}

  async verifyEmail(email: string) {
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

    const token = JwtStrategy.generateTokenRegister(email, '1h');
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
      <p><a href="http://localhost:3000/verify-email?token=${token}" target="_blank">Verify Email</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best regards,</p>
      <p>Redflag GoldenStart</p>
    `;
    this.mailService.sendSimpleEmail(email, subject, content);
    throw new HttpException('Send mail successfully', HttpStatus.OK);
  }

  // async verify_token(token: string): Promise<boolean> {
  //   if()
  //   return true;
  // }
  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // if(!this.verify_token(createUserDto.token)){
    //   throw new HttpException('Token invalid', HttpStatus.FORBIDDEN);
    // }
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
      password: hashedPassword,
      gender: createUserDto.gender,
      birthDay: createUserDto.birthDay,
      phoneNumber: createUserDto.phoneNumber,
      role: createUserDto.role,
    });
    if (!newUser) {
      throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const savedUser = await this.userRepository.save(newUser);
    const userResponse: UserResponseDto = {
      user_id: savedUser.user_id,
      email: savedUser.email,
      username: savedUser.username,
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
      throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
    }

    const passwordMatch = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );
    if (!passwordMatch) {
      throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
    }

    const token = JwtStrategy.generateToken(user, '2h');
    const refreshToken = JwtStrategy.generateToken(user, '7d');
    const loginResponse: LoginResponseDto = {
      token,
      refreshToken,
      email: user.email,
      username: user.username,
      gender: user.gender,
      birthDay: user.birthDay,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    throw new HttpException(loginResponse, HttpStatus.OK);
  }
}
