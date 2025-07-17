import { Controller, Get, Put, Param, Body, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserNotifyService } from './user_notify.service';
import { UpdateUserNotifyDto } from './dto/user-notify.dto';
import { UserNotify } from './entities/User_Notify.entity';

@ApiTags('User Notifications')
@Controller('api/user_notify/')
export class UserNotifyController {
  constructor(private readonly userNotifyService: UserNotifyService) {}
  @ApiBearerAuth('Authorization')
  @Get('all')
  @ApiOperation({ summary: 'Get all user notifications' })
  @ApiResponse({
    status: 200,
    description: 'List of user notifications',
    type: [UserNotify],
  })
  async findAllUserNotifies(): Promise<UserNotify[]> {
    return await this.userNotifyService.findAllUserNotifies();
  }

  @ApiBearerAuth('Authorization')
  @Get(':userId')
  @ApiOperation({ summary: 'Get user notifications by user ID' })
  @ApiResponse({
    status: 200,
    description: 'User notifications',
    type: [UserNotify],
  })
  @ApiResponse({ status: 404, description: 'User notifications not found' })
  async findUserNotifyById(
    @Param('userId') userId: string,
  ): Promise<UserNotify[]> {
    return await this.userNotifyService.findUserNotifyById(userId);
  }

  @ApiBearerAuth('Authorization')
  @Put('update/:id')
  @ApiOperation({ summary: 'Update a user notification status' })
  @ApiResponse({
    status: 200,
    description: 'User notification updated successfully',
    type: UserNotify,
  })
  @ApiResponse({ status: 404, description: 'User notification not found' })
  async updateUserNotify(
    @Param('id') id: string,
    @Body() updateUserNotifyDto: UpdateUserNotifyDto,
  ): Promise<UserNotify> {
    return await this.userNotifyService.updateUserNotify(
      id,
      updateUserNotifyDto,
    );
  }

  @ApiBearerAuth('Authorization')
  @Post('mark-all-sent/:user_id')
  @ApiOperation({ summary: 'Mark all unsent notifications as sent for a user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as sent' })
  async markAllNotificationsAsSent(
    @Param('user_id') user_id: string,
  ): Promise<void> {
    await this.userNotifyService.markAllNotificationsAsSent(user_id);
  }
}
