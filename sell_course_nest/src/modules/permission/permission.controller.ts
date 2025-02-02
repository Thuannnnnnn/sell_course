import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionService } from './permission.service';
import { Permission } from './entities/permission.entity';
@ApiTags('Permissions')
@Controller('api/admin/permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}
  @Post('add_permission')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({
    status: 201,
    description: 'Permission created successfully',
    type: Permission,
  })
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
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({
    status: 200,
    description: 'Return all permissions',
    type: [Permission],
  })
  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionService.getAllPermissions();
  }

  @Get('view_permission_id/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get a permission by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return permission details',
    type: Permission,
  })
  async getPermissionById(@Param('id') id: number): Promise<Permission> {
    return this.permissionService.getPermissionById(id);
  }

  @Put('update_permission/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update a permission' })
  @ApiResponse({
    status: 200,
    description: 'Permission updated successfully',
    type: Permission,
  })
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
  @Delete('delete_permission/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  async deletePermission(@Param('id') id: number): Promise<void> {
    return this.permissionService.deletePermission(id);
  }
}
