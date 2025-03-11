import {
  Controller,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NotifyService } from './notify.service';
import { CreateNotifyDto, UpdateNotifyDto } from './dto/notify.dto';
import { Notify } from './entities/notify.entity';

@ApiTags('Notifications')
@Controller('api/admin/notify/')
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

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
  ): Promise<Notify> {
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
  ): Promise<Notify> {
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
  async deleteNotify(@Param('id') id: string): Promise<void> {
    return await this.notifyService.removeNotification(id);
  }
}
