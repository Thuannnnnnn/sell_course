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
import { UserNotify } from '../User_Notify/entities/user_Notify.entity';

@ApiTags('Notifications')
@Controller('api/admin/notify')
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @Get('all')
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({
    status: 200,
    description: 'List of notifications',
    type: [Notify],
  })
  async findAllNotify(): Promise<Notify[]> {
    return await this.notifyService.findAll();
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Get('course/:id')
  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification details',
    type: Notify,
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findNotifyByCourse(@Param('id') id: string): Promise<Notify[]> {
    return await this.notifyService.findByCourse(id);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification details',
    type: Notify,
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findNotifyByUser(@Param('id') id: string): Promise<UserNotify[]> {
    return await this.notifyService.findByUser(id);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification by ID' })
  @ApiResponse({
    status: 204,
    description: 'Notification deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async deleteNotify(@Param('id') id: string): Promise<void> {
    return await this.notifyService.remove(id);
  }
}
