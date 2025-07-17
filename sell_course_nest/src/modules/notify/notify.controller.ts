import {
  Controller,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NotifyService } from './notify.service';
import { CreateNotifyDto, UpdateNotifyDto } from './dto/notify.dto';
import { RoleListDto } from './dto/role-list.dto';
import { Notify } from './entities/notify.entity';

@ApiTags('Notifications')
@Controller('api/admin/notify/')
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({
    status: 200,
    description: 'List of notifications',
    type: [Notify],
  })
  async getAll(): Promise<Notify[]> {
    return await this.notifyService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification found', type: Notify })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async getById(@Param('id') id: string): Promise<Notify> {
    return await this.notifyService.getById(id);
  }
  
  @ApiBearerAuth('Authorization')
  @Post('create')
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
    type: Notify,
  })
  async createNotify(
    @Body() createNotifyDto: CreateNotifyDto,
  ): Promise<{notify: Notify, warnings?: string[]}> {
    return await this.notifyService.create(createNotifyDto);
  }

  @ApiBearerAuth('Authorization')
  @Put(':id')
  @ApiOperation({ summary: 'Update a notification by ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification updated successfully',
    type: Notify,
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async updateNotify(
    @Param('id') id: string,
    @Body() updateNotifyDto: UpdateNotifyDto,
  ): Promise<{notify: Notify, warnings?: string[]}> {
    return await this.notifyService.update(id, updateNotifyDto);
  }

  @ApiBearerAuth('Authorization')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification by ID' })
  @ApiResponse({
    status: 204,
    description: 'Notification deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async deleteNotify(@Param('id') id: string): Promise<string> {
    return await this.notifyService.removeNotification(id);
  }

  @Get(':id/users')
  @ApiOperation({ summary: 'Get user IDs who received this notification' })
  @ApiResponse({
    status: 200,
    description: 'List of user IDs',
    schema: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async getNotifyUserIds(@Param('id') id: string): Promise<string[]> {
    return await this.notifyService.getNotifyUserIds(id);
  }

  @Get(':id/courses')
  @ApiOperation({ summary: 'Get course IDs associated with this notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification type and list of course IDs',
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['USER', 'COURSE', 'GLOBAL', 'ADMIN'],
        },
        courseIds: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async getNotifyCourseIds(@Param('id') id: string): Promise<{
    type: string;
    courseIds: string[];
  }> {
    return await this.notifyService.getNotifyCourseIds(id);
  }
}
