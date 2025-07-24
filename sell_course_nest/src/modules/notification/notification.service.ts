import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { UserNotification } from './entities/user-notification.entity';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponseDto, NotificationListResponseDto } from './dto/notification-response.dto';
import { MarkNotificationDto, MarkAllNotificationsDto } from './dto/mark-notification.dto';
import { NotificationStatus } from './enums/notification-type.enum';

@Injectable()
export class NotificationService {
  private notificationGateway: any; // Will be injected later to avoid circular dependency

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(UserNotification)
    private userNotificationRepository: Repository<UserNotification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  // Method để set gateway (sẽ được gọi từ module)
  setNotificationGateway(gateway: any) {
    this.notificationGateway = gateway;
  }

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const { recipientIds, courseId, createdBy, ...notificationData } = createNotificationDto;

    // Tạo notification
    const notification = this.notificationRepository.create(notificationData);

    // Gán course nếu có
    if (courseId) {
      const course = await this.courseRepository.findOne({ where: { courseId } });
      if (course) {
        notification.course = course;
      }
    }

    // Gán người tạo nếu có
    if (createdBy) {
      const creator = await this.userRepository.findOne({ where: { user_id: createdBy } });
      if (creator) {
        notification.createdBy = creator;
      }
    }

    const savedNotification = await this.notificationRepository.save(notification);

    // Tạo user notifications cho từng recipient
    const userNotifications = recipientIds.map(userId => {
      const userNotification = this.userNotificationRepository.create({
        notification: savedNotification,
        user: { user_id : userId } as User,
        status: NotificationStatus.UNREAD,
      });
      return userNotification;
    });

    await this.userNotificationRepository.save(userNotifications);

    // Gửi thông báo real-time qua WebSocket
    if (this.notificationGateway) {
      const notificationData = {
        id: savedNotification.id,
        title: savedNotification.title,
        message: savedNotification.message,
        type: savedNotification.type,
        priority: savedNotification.priority,
        createdAt: savedNotification.createdAt,
        course: savedNotification.course ? {
          courseId: savedNotification.course.courseId,
          title: savedNotification.course.title,
        } : undefined,
      };

      // Gửi cho từng recipient
      try {
        await this.notificationGateway.sendNotificationToUsers(recipientIds, notificationData);
      } catch (error) {
        console.error('Failed to send real-time notification:', error);
      }
    }

    return savedNotification;
  }

  async getUserNotifications(
    user_id: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<NotificationListResponseDto> {
    const skip = (page - 1) * limit;

    const [userNotifications, total] = await this.userNotificationRepository.findAndCount({
      where: { user: { user_id } },
      relations: [
        'notification',
        'notification.course',
        'notification.course.instructor',
        'notification.createdBy',
      ],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const unreadCount = await this.userNotificationRepository.count({
      where: { 
        user: { user_id },
        status: NotificationStatus.UNREAD,
      },
    });

    const notifications: NotificationResponseDto[] = userNotifications.map(userNotification => ({
      id: userNotification.notification.id,
      title: userNotification.notification.title,
      message: userNotification.notification.message,
      type: userNotification.notification.type,
      priority: userNotification.notification.priority,
      metadata: userNotification.notification.metadata || {},
      status: userNotification.status,
      readAt: userNotification.readAt,
      createdAt: userNotification.notification.createdAt,
      course: userNotification.notification.course ? {
        courseId: userNotification.notification.course.courseId,
        title: userNotification.notification.course.title,
        instructor: {
          user_id: userNotification.notification.course.instructor.user_id,
          username: userNotification.notification.course.instructor.username,
        },
      } : undefined,
    }));

    return {
      notifications,
      total,
      unreadCount,
    };
  }

  async markNotification(userId: string, markNotificationDto: MarkNotificationDto): Promise<void> {
    const userNotification = await this.userNotificationRepository.findOne({
      where: {
        user: { user_id: userId },
        notification: { id: markNotificationDto.notificationId },
      },
    });

    if (!userNotification) {
      throw new NotFoundException('Notification not found');
    }

    userNotification.status = markNotificationDto.status;
    if (markNotificationDto.status === NotificationStatus.READ && !userNotification.readAt) {
      userNotification.readAt = new Date();
    }

    await this.userNotificationRepository.save(userNotification);
  }

  async markAllNotifications(userId: string, markAllDto: MarkAllNotificationsDto): Promise<void> {
    const userNotifications = await this.userNotificationRepository.find({
      where: { 
        user: { user_id: userId },
        status: NotificationStatus.UNREAD,
      },
    });

    for (const userNotification of userNotifications) {
      userNotification.status = markAllDto.status;
      if (markAllDto.status === NotificationStatus.READ && !userNotification.readAt) {
        userNotification.readAt = new Date();
      }
    }

    await this.userNotificationRepository.save(userNotifications);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.userNotificationRepository.count({
      where: { 
        user: { user_id: userId },
        status: NotificationStatus.UNREAD,
      },
    });
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const userNotification = await this.userNotificationRepository.findOne({
      where: {
        user: { user_id: userId },
        notification: { id: notificationId },
      },
    });

    if (!userNotification) {
      throw new NotFoundException('Notification not found');
    }

    await this.userNotificationRepository.remove(userNotification);
  }

  async getNotificationDetail(userId: string, notificationId: string): Promise<any> {
    console.log(`📖 Getting notification detail: ${notificationId} for user: ${userId}`);

    const userNotification = await this.userNotificationRepository.findOne({
      where: {
        user: { user_id: userId },
        notification: { id: notificationId },
      },
      relations: [
        'notification',
        'notification.course',
        'notification.course.instructor',
        'notification.course.category',
        'notification.createdBy',
      ],
    });

    if (!userNotification) {
      throw new NotFoundException('Notification not found');
    }

    // Transform to DTO format
    return {
      id: userNotification.notification.id,
      title: userNotification.notification.title,
      message: userNotification.notification.message,
      type: userNotification.notification.type,
      priority: userNotification.notification.priority,
      metadata: userNotification.notification.metadata,
      status: userNotification.status,
      readAt: userNotification.readAt,
      createdAt: userNotification.notification.createdAt,
      course: userNotification.notification.course ? {
        courseId: userNotification.notification.course.courseId,
        title: userNotification.notification.course.title,
        thumbnail: userNotification.notification.course.thumbnail,
        instructor: {
          user_id: userNotification.notification.course.instructor.user_id,
          username: userNotification.notification.course.instructor.username,
        },
        category: userNotification.notification.course.category ? {
          categoryId: userNotification.notification.course.category.categoryId,
          name: userNotification.notification.course.category.name,
        } : null,
      } : null,
      createdBy: userNotification.notification.createdBy ? {
        user_id: userNotification.notification.createdBy.user_id,
        username: userNotification.notification.createdBy.username,
      } : null,
    };
  }

  async archiveNotification(userId: string, notificationId: string): Promise<void> {
    console.log(`📦 Archiving notification: ${notificationId} for user: ${userId}`);

    const userNotification = await this.userNotificationRepository.findOne({
      where: {
        user: { user_id: userId },
        notification: { id: notificationId },
      },
    });

    if (!userNotification) {
      throw new NotFoundException('Notification not found');
    }

    // Update status to ARCHIVED
    userNotification.status = NotificationStatus.ARCHIVED;
    await this.userNotificationRepository.save(userNotification);

    console.log(`✅ Notification archived: ${notificationId}`);
  }
}