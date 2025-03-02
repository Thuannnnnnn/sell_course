import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotifyService } from './notify.service';
import { CreateNotifyDto, UpdateNotifyDto } from './dto/notify.dto';
import { Notify } from './entities/notify.entity';

@ApiTags('Notifications')
@Controller('notify')
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
    type: Notify,
  })
  async createNotify(
    @Body() createNotifyDto: CreateNotifyDto,
  ): Promise<Notify> {
    return await this.notifyService.createNotify(createNotifyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({
    status: 200,
    description: 'List of notifications',
    type: [Notify],
  })
  async findAllNotify(): Promise<Notify[]> {
    return await this.notifyService.findAllNotify();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification details',
    type: Notify,
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findNotifyById(@Param('id') id: string): Promise<Notify> {
    return await this.notifyService.findNotifyById(id);
  }

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
    return await this.notifyService.updateNotify(id, updateNotifyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification by ID' })
  @ApiResponse({
    status: 204,
    description: 'Notification deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async deleteNotify(@Param('id') id: string): Promise<{ message: string }> {
    return await this.notifyService.deleteNotify(id);
  }
}
