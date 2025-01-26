// permission.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { Permission } from './entities/permission.entity';

@Controller('api/admin/permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}
  @Post('add_permission')
  async createPermission(
    @Body('name') name: string,
    @Body('code') code: string,
    @Body('parentId') parentId: number,
    @Body('description') description: string,
  ): Promise<Permission> {
    return this.permissionService.createPermission(
      name,
      code,
      parentId,
      description,
    );
  }

  @Get('view_permission')
  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionService.getAllPermissions();
  }
  @Get('view_permission_id/:id')
  async getPermissionById(@Param('id') id: number): Promise<Permission> {
    return this.permissionService.getPermissionById(id);
  }
  @Put('update_permission/:id')
  async updatePermission(
    @Param('id') id: number,
    @Body('name') name: string,
    @Body('code') code: string,
    @Body('parentId') parentId: number,
    @Body('description') description: string,
  ): Promise<Permission> {
    return this.permissionService.updatePermission(
      id,
      name,
      code,
      parentId,
      description,
    );
  }

  // 5. Delete Permission
  @Delete('delete_permission/:id')
  async deletePermission(@Param('id') id: number): Promise<void> {
    return this.permissionService.deletePermission(id);
  }
}
