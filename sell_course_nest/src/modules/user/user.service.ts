import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDto } from './dto/userData.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async getAllUser(): Promise<UserDto[]> {
    const users = await this.userRepository.find();
    return users.map((user) => {
      return new UserDto(
        user.user_id,
        user.email,
        user.username,
        user.avartaImg,
        user.gender,
        user.birthDay,
        user.phoneNumber,
        user.role,
      );
    });
  }
  async changePassword(
    email: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<string> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      console.log('Tim user ne', user);

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      if (newPassword !== confirmPassword) {
        throw new BadRequestException(
          'New password and confirm password do not match',
        );
      }
      user.password = await bcrypt.hash(newPassword, 10);
      await this.userRepository.save(user);
      return 'Password changed successfully';
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(
          error.message || 'Failed to change password',
        );
      }
      throw new BadRequestException('Failed to change password');
    }
  }

  async getUserById(user_id: string): Promise<UserDto | null> {
    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) {
      return null;
    }

    return new UserDto(
      user.user_id,
      user.email,
      user.username,
      user.avartaImg,
      user.gender,
      user.birthDay,
      user.phoneNumber,
      user.role,
    );
  }
}
