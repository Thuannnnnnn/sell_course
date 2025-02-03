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
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { Permission } from '../permission/entities/permission.entity';
import { UserDTO } from './dto/userData.dto';

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

  async changePassword(
    email: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<string> {
    // Find the user by user_id (which matches the value from the token)
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Validate current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    // Check if new password matches confirm password
    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        'New password and confirm password do not match',
      );
    }
    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    // Update the user's password
    user.password = hashedNewPassword;
    await this.userRepository.save(user); // Ensure that this saves the updated user in the database
    return 'Password changed successfully';
  }
  async updateProfile(
    email: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateProfileDto);
    return this.userRepository.save(user);
  }
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
}
