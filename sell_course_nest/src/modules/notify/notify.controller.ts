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
  UseGuards,
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
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('api/admin/notify')
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Authorization')
  @Post('create_notify')
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
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Get('get_all_notify')
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({
    status: 200,
    description: 'List of notifications',
    type: [Notify],
  })
  async findAllNotify(): Promise<Notify[]> {
    return await this.notifyService.findAllNotify();
  }
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Get('get_notify/:id')
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
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Put('update_notify/:id')
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
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Delete('delete_notify/:id')
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
