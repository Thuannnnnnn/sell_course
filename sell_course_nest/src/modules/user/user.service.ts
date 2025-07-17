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

  async searchUsers(query: string, page: number = 1, limit: number = 0): Promise<{
    users: UserDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    console.log('🔍 SearchUsers called with:', { query, page, limit });
    
    // No pagination - load all users
    const skip = 0;
    
    try {
      // Query with permissions relation - NO LIMIT
      const queryBuilder = this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.permissions', 'permissions')
        .orderBy('user.createdAt', 'DESC'); // Order by newest first

      if (query && query.trim() !== '') {
        queryBuilder.where(
          '(LOWER(user.email) LIKE LOWER(:query) OR LOWER(user.username) LIKE LOWER(:query))',
          { query: `%${query.trim()}%` }
        );
      }

      // Log the generated SQL
      console.log('📡 Generated SQL:', queryBuilder.getSql());
      console.log('📡 Parameters:', queryBuilder.getParameters());

      const [users, total] = await queryBuilder.getManyAndCount();
      
      console.log('✅ Query successful, found users:', users.length);
      
      return {
        users: users.map(user => new UserDTO({
          ...user,
          phoneNumber: user.phoneNumber?.toString() ?? null,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('❌ SearchUsers error:', error);
      
      // Fallback to simple query without QueryBuilder
      try {
        console.log('🔄 Trying fallback method...');
        const users = await this.userRepository.find({
          skip,
          take: limit,
          order: { createdAt: 'DESC' }
        });
        
        const total = await this.userRepository.count();
        
        return {
          users: users.map(user => {
            try {
              return new UserDTO({
                ...user,
                phoneNumber: user.phoneNumber?.toString() ?? null,
                permissions: user.permissions || [] // Ensure permissions is always an array
              });
            } catch (dtoError) {
              console.error('❌ UserDTO creation error for user:', user.user_id, dtoError);
              // Return a minimal user object if DTO fails
              return {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role,
                isBan: user.isBan,
                permissions: [],
                avatarImg: user.avatarImg,
                name: user.username, // Use username as name fallback
                gender: user.gender,
                birthDay: user.birthDay,
                phoneNumber: user.phoneNumber?.toString() ?? null,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
              };
            }
          }),
          total,
          page: 1, // Always page 1 since no pagination
          limit: total, // Limit equals total (all items)
          totalPages: 1 // Always 1 page since no pagination
        };
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        throw fallbackError;
      }
    }
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
      user.createdAt,
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
      user.createdAt,
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
      user.createdAt,
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
      user.createdAt,
    );
  }
}
