import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Permission } from '../permission/entities/permission.entity';
import { azureUpload } from 'src/utilities/azure.service';
import { UserDTO } from './dto/userData.dto';
import { UserDto } from './dto/updateProfile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}
  async getUser(user_id: string): Promise<UserDTO | null> {
    const user = await this.userRepository.findOne({
      where: { user_id },
      relations: ['permissions'],
    });

    if (!user) {
      return null;
    }

    return new UserDTO({ ...user, phoneNumber: user.phoneNumber.toString() });
  }
  async findAll(): Promise<UserDTO[] | null> {
    const users = await this.userRepository.find({
      relations: ['permissions'],
    });

    return users.length
      ? users.map(
          (user) =>
            new UserDTO({
              ...user,
              phoneNumber: user.phoneNumber?.toString() ?? null,
            }),
        )
      : null;
  }
  async findById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['permissions'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async addPermissions(userId: string, permissionIds: number[]): Promise<User> {
    const user = await this.findById(userId);
    const permissions = await this.permissionRepository.findBy({
      id: In(permissionIds),
    });
    user.permissions = [...user.permissions, ...permissions];
    return this.userRepository.save(user);
  }
  async removePermission(userId: string, permissionId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['permissions'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const permissionIdNumber = Number(permissionId);
    const permissionIndex = user.permissions.findIndex(
      (p) => p.id === permissionIdNumber,
    );
    if (permissionIndex === -1) {
      throw new BadRequestException(
        `Permission ID ${permissionId} not found in user's permissions`,
      );
    }
    user.permissions.splice(permissionIndex, 1);
    await this.userRepository.save(user);
    return user;
  }

  async changePassword(
    user_id: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<string> {
    try {
      const user = await this.userRepository.findOne({ where: { user_id } });
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
      user.avatarImg,
      user.gender,
      user.birthDay,
      user.phoneNumber,
      user.isOAuth,
      user.role,
      user.isBan,
    );
  }
  async getMe(user_id: string): Promise<UserDTO> {
    const user = await this.userRepository.findOne({
      where: { user_id },
      relations: ['permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserDTO({ ...user, phoneNumber: user.phoneNumber.toString() });
  }

  async updateUserById(
    user_id: string,
    updateData: Partial<UserDto>,
    file?: Express.Multer.File,
  ): Promise<UserDto | null> {
    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) {
      return null;
    }
    if (file) {
      try {
        const avatarUrl = await azureUpload(file);
        updateData.avatarImg = avatarUrl;
      } catch {
        throw new Error('Failed to upload avatar to Azure Blob Storage.');
      }
    }
    console.log('Update data:', file, updateData);
    Object.assign(user, updateData);
    await this.userRepository.save(user);
    return new UserDto(
      user.user_id,
      user.email,
      user.username,
      user.avatarImg,
      user.gender,
      user.birthDay,
      user.phoneNumber,
      user.isOAuth,
      user.role,
      user.isBan,
    );
  }

  async updateUser(
    userId: string,
    updateData: Partial<UserDto>,
  ): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (updateData.email) {
      const existingUserWithEmail = await this.userRepository.findOne({
        where: { email: updateData.email },
      });
      if (existingUserWithEmail && existingUserWithEmail.user_id !== userId) {
        throw new BadRequestException('Email already exists.');
      }
    }

    if (updateData.username) {
      const existingUserWithUsername = await this.userRepository.findOne({
        where: { username: updateData.username },
      });
      if (
        existingUserWithUsername &&
        existingUserWithUsername.user_id !== userId
      ) {
        throw new BadRequestException('Username already exists.');
      }
    }
    Object.assign(user, updateData);
    await this.userRepository.save(user);
    return new UserDto(
      user.user_id,
      user.email,
      user.username,
      user.avatarImg,
      user.gender,
      user.birthDay,
      user.phoneNumber,
      user.isOAuth,
      user.role,
      user.isBan,
    );
  }
  async banUser(userId: string, isBan: boolean): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Cập nhật trạng thái isBan
    user.isBan = isBan;
    await this.userRepository.save(user);

    // Trả về UserDto
    return new UserDto(
      user.user_id,
      user.email,
      user.username,
      user.avatarImg,
      user.gender,
      user.birthDay,
      user.phoneNumber,
      user.isOAuth,
      user.role,
      user.isBan,
    );
  }
}
