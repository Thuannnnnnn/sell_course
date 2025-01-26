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
import { azureUpload } from 'src/utilities/azure.service';
// import { UpdateUserDto } from './dto/updateUser.dto';

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
        user.gender,
        user.avartaImg,
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
  async updateUserById(
    email: string,
    updateData: Partial<UserDto>,
    file?: Express.Multer.File,
  ): Promise<UserDto | null> {
    // Tìm user bằng email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return null;
    }

    // Nếu có file, upload avatar mới lên Azure Blob Storage
    if (file) {
      try {
        const avatarUrl = await azureUpload(file); // Upload file lên Azure Blob
        updateData.avartaImg = avatarUrl;
      } catch (error) {
        throw new Error('Failed to upload avatar to Azure Blob Storage.');
      }
    }
    console.log('Update data:', file, updateData);

    // Cập nhật thông tin user
    Object.assign(user, updateData);
    await this.userRepository.save(user);

    // Trả về UserDto
    return new UserDto(
      user.user_id,
      user.email,
      user.username,
      user.gender,
      user.avartaImg,
      user.birthDay,
      user.phoneNumber,
      user.role,
    );
  }
}
