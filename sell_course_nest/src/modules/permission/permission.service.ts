// permission.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: TreeRepository<Permission>,
  ) {}

  // 1. Create Permission
  async createPermission(
    name: string,
    code: string,
    parentId: number,
    description: string,
  ): Promise<Permission> {
    const parentPermission = parentId
      ? await this.permissionRepository.findOne({ where: { id: parentId } })
      : null;

    const permission = this.permissionRepository.create({
      name,
      code,
      description,
      parent: parentPermission, // Thiết lập quyền cha nếu có
    });

    return await this.permissionRepository.save(permission);
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.findTrees();
  }
  async getPermissionById(id: number): Promise<Permission> {
    return this.permissionRepository.findOne({ where: { id } });
  }
  async updatePermission(
    id: number,
    name: string,
    code: string,
    parentId: number | null,
    description: string,
  ): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new Error('Permission not found');
    }

    permission.name = name;
    permission.code = code;
    permission.description = description;

    if (parentId !== null) {
      const parentPermission = await this.permissionRepository.findOne({
        where: { id: parentId },
      });
      permission.parent = parentPermission;
    } else {
      permission.parent = null;
    }

    return this.permissionRepository.save(permission);
  }
  async deletePermission(id: number): Promise<void> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new Error('Permission not found');
    }
    await this.permissionRepository.query(`
      DELETE FROM permission_closure WHERE descendant_id = ${permission.id} OR ancestor_id = ${permission.id}
    `);

    await this.permissionRepository.remove(permission);
  }
}
