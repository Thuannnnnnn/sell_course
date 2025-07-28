import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { NotificationService } from './notification.service';
import { NotificationListResponseDto } from './dto/notification-response.dto';
import { MarkNotificationDto, MarkAllNotificationsDto } from './dto/mark-notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(
    @Request() req: { user: { user_id: string } },
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ): Promise<NotificationListResponseDto> {
    if (!req.user || !req.user.user_id) {
      throw new UnauthorizedException('User not authenticated');
    }
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    return this.notificationService.getUserNotifications(
      req.user.user_id,
      pageNum,
      limitNum,
    );
  }

  @Get('unread-count')
  async getUnreadCount(
    @Request() req: { user: { user_id: string } },
  ): Promise<{ count: number }> {
    if (!req.user || !req.user.user_id) {
      throw new UnauthorizedException('User not authenticated');
    }
    
    const count = await this.notificationService.getUnreadCount(req.user.user_id);
    return { count };
  }

  @Patch('mark')
  async markNotification(
    @Request() req: { user: { user_id: string } },
    @Body() markNotificationDto: MarkNotificationDto,
  ): Promise<{ message: string }> {
    if (!req.user || !req.user.user_id) {
      throw new UnauthorizedException('User not authenticated');
    }
    
    await this.notificationService.markNotification(req.user.user_id, markNotificationDto);
    return { message: 'Notification marked successfully' };
  }

  @Patch('mark-all')
  async markAllNotifications(
    @Request() req: { user: { user_id: string } },
    @Body() markAllDto: MarkAllNotificationsDto,
  ): Promise<{ message: string }> {
    if (!req.user || !req.user.user_id) {
      throw new UnauthorizedException('User not authenticated');
    }
    
    await this.notificationService.markAllNotifications(req.user.user_id, markAllDto);
    return { message: 'All notifications marked successfully' };
  }

  @Delete(':notificationId')
  async deleteNotification(
    @Request() req: { user: { user_id: string } },
    @Param('notificationId') notificationId: string,
  ): Promise<{ message: string }> {
    if (!req.user || !req.user.user_id) {
      throw new UnauthorizedException('User not authenticated');
    }
    
    await this.notificationService.deleteNotification(req.user.user_id, notificationId);
    return { message: 'Notification deleted successfully' };
  }

  @Get(':id/detail')
  @UseGuards(JwtAuthGuard)
  async getNotificationDetail(
    @Param('id') notificationId: string,
    @Request() req: { user: { user_id: string } }
  ) {
    if (!req.user || !req.user.user_id) {
      throw new UnauthorizedException('User not authenticated');
    }
    
    console.log(`📖 Getting notification detail: ${notificationId} for user: ${req.user.user_id}`);
    
    const notification = await this.notificationService.getNotificationDetail(req.user.user_id, notificationId);
    return notification;
  }

  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard)
  async archiveNotification(
    @Param('id') notificationId: string,
    @Request() req: { user: { user_id: string } }
  ) {
    if (!req.user || !req.user.user_id) {
      throw new UnauthorizedException('User not authenticated');
    }
    
    console.log(`📦 Archiving notification: ${notificationId} for user: ${req.user.user_id}`);
    
    await this.notificationService.archiveNotification(req.user.user_id, notificationId);
    return { message: 'Notification archived successfully' };
  }
}