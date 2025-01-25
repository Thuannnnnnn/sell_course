import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Permission } from '../permission/entities/permission.entity';
import { In } from 'typeorm';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}
  async findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['permissions'] });
  }

  async findById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['permissions'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Thêm quyền cho người dùng
  async addPermissions(userId: string, permissionIds: number[]): Promise<User> {
    const user = await this.findById(userId);
    const permissions = await this.permissionRepository.findBy({
      id: In(permissionIds),
    });
    user.permissions = [...user.permissions, ...permissions];
    return this.userRepository.save(user);
  }

  // Xóa quyền của người dùng
  async removePermission(userId: string, permissionId: number): Promise<User> {
    const user = await this.findById(userId);
    user.permissions = user.permissions.filter(
      (permission) => permission.id !== permissionId,
    );
    return this.userRepository.save(user);
  }
}
