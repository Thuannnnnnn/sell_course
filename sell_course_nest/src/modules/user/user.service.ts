import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
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
  async getUser(email: string): Promise<UserDTO | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['permissions'],
    });

    if (!user) {
      return null;
    }

    return new UserDTO({ ...user, phoneNumber: user.phoneNumber.toString() });
  }

  // async changePassword(
  //   email: string,
  //   currentPassword: string,
  //   newPassword: string,
  //   confirmPassword: string,
  // ): Promise<string> {
  //   // Find the user by user_id (which matches the value from the token)
  //   const user = await this.userRepository.findOne({ where: { email } });
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }
  //   // Validate current password
  //   const isCurrentPasswordValid = await bcrypt.compare(
  //     currentPassword,
  //     user.password,
  //   );
  //   if (!isCurrentPasswordValid) {
  //     throw new UnauthorizedException('Current password is incorrect');
  //   }
  //   // Check if new password matches confirm password
  //   if (newPassword !== confirmPassword) {
  //     throw new BadRequestException(
  //       'New password and confirm password do not match',
  //     );
  //   }
  //   // Hash the new password
  //   const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  //   // Update the user's password
  //   user.password = hashedNewPassword;
  //   await this.userRepository.save(user); // Ensure that this saves the updated user in the database
  //   return 'Password changed successfully';
  // }
  // async updateProfile(
  //   email: string,
  //   updateProfileDto: UpdateProfileDto,
  // ): Promise<User> {
  //   const user = await this.userRepository.findOne({ where: { email } });

  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   Object.assign(user, updateProfileDto);
  //   return this.userRepository.save(user);
  // }
  async findAll(): Promise<UserDTO[]> {
    const users = await this.userRepository.find({
      relations: ['permissions'],
    });
    return users.map(
      (user) =>
        new UserDTO({ ...user, phoneNumber: user.phoneNumber.toString() }),
    );
  }

  async findById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['permissions'],
    });
    if (!user) throw new NotFoundException('User not found');
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
      user.avatarImg,
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
        updateData.avatarImg = avatarUrl;
      } catch {
        throw new Error('Failed to upload avatar to Azure Blob Storage.');
      }
    }
    console.log('Update data:', file, updateData);

    Object.assign(user, updateData);
    await this.userRepository.save(user);

    // Trả về UserDto
    return new UserDto(
      user.user_id,
      user.email,
      user.username,
      user.gender,
      user.avatarImg,
      user.birthDay,
      user.phoneNumber,
      user.role,
    );
  }
}
