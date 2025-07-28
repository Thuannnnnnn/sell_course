import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { UserNotification } from './entities/user-notification.entity';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { 
  NotificationResponseDto, 
  NotificationListResponseDto, 
  NotificationDetailResponseDto,
  RealTimeNotificationData 
} from './dto/notification-response.dto';
import { MarkNotificationDto, MarkAllNotificationsDto } from './dto/mark-notification.dto';
import { NotificationStatus } from './enums/notification-type.enum';
import { NotificationRuleService, NotificationContext } from './notification-rule.service';
import { NotificationEvent } from './constants/notification.constants';
import { INotificationGateway } from './interfaces/notification-gateway.interface';

@Injectable()
export class NotificationService {
  private notificationGateway: INotificationGateway | null = null;

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(UserNotification)
    private userNotificationRepository: Repository<UserNotification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private notificationRuleService: NotificationRuleService,
  ) {}

  // Method để set gateway (sẽ được gọi từ module)
  setNotificationGateway(gateway: INotificationGateway): void {
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
      const notificationData: RealTimeNotificationData = {
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

  async getNotificationDetail(userId: string, notificationId: string): Promise<NotificationDetailResponseDto> {
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

  // ========== RULE-BASED NOTIFICATION METHODS ==========

  /**
   * Create notification using rule-based approach
   * This is the new preferred method for creating notifications
   */
  async createRuleBasedNotification(
    event: NotificationEvent,
    context: NotificationContext,
    skipUsers?: string[] // Users to exclude from notification
  ): Promise<Notification> {
    console.log(`🔔 Creating rule-based notification for event: ${event}`);

    // Process event using rule service
    const ruleResult = await this.notificationRuleService.processNotificationEvent(event, context);
    
    // Get recipient user IDs based on database roles
    const recipientIds = await this.getUsersByDatabaseRoles(ruleResult.databaseRoles);
    
    // Filter out excluded users
    const filteredRecipientIds = skipUsers 
      ? recipientIds.filter(id => !skipUsers.includes(id))
      : recipientIds;

    if (filteredRecipientIds.length === 0) {
      console.log(`⚠️ No recipients found for event: ${event}`);
      return null;
    }

    // Create notification using existing method
    const createNotificationDto: CreateNotificationDto = {
      title: ruleResult.title,
      message: ruleResult.message,
      type: ruleResult.notificationType,
      priority: ruleResult.priority,
      recipientIds: filteredRecipientIds,
      courseId: context.courseId,
      createdBy: context.triggeredBy,
      metadata: {
        event,
        context: {
          courseId: context.courseId,
          userId: context.userId,
          chatSessionId: context.chatSessionId,
        }
      }
    };

    return await this.createNotification(createNotificationDto);
  }

  /**
   * Helper: Get user IDs by their database role strings
   */
  private async getUsersByDatabaseRoles(databaseRoles: string[]): Promise<string[]> {
    if (databaseRoles.length === 0) {
      return [];
    }

    const users = await this.userRepository.find({
      where: {
        role: In(databaseRoles)
      },
      select: ['user_id']
    });

    return users.map(user => user.user_id);
  }

  // ========== CONVENIENCE METHODS FOR SPECIFIC EVENTS ==========

  /**
   * Flow 1: Course submitted for review
   */
  async notifyCourseSubmittedForReview(courseId: string, instructorId: string): Promise<Notification> {
    const course = await this.courseRepository.findOne({ 
      where: { courseId },
      relations: ['instructor']
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const context: NotificationContext = {
      courseId,
      courseTitle: course.title,
      instructorId,
      instructorName: course.instructor?.username || 'Unknown',
      triggeredBy: instructorId
    };

    return await this.createRuleBasedNotification(
      NotificationEvent.COURSE_SUBMITTED_FOR_REVIEW,
      context,
      [instructorId] // Don't notify the instructor who submitted
    );
  }

  /**
   * Flow 2: Course published (approved)
   */
  async notifyCoursePublished(courseId: string, reviewerId: string): Promise<Notification> {
    const course = await this.courseRepository.findOne({ 
      where: { courseId },
      relations: ['instructor']
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const context: NotificationContext = {
      courseId,
      courseTitle: course.title,
      instructorId: course.instructor?.user_id,
      instructorName: course.instructor?.username || 'Unknown',
      triggeredBy: reviewerId
    };

    return await this.createRuleBasedNotification(
      NotificationEvent.COURSE_PUBLISHED,
      context,
      [reviewerId] // Don't notify the reviewer who approved
    );
  }

  /**
   * Flow 3: Course rejected
   */
  async notifyCourseRejected(courseId: string, reviewerId: string, rejectionReason: string): Promise<Notification> {
    const course = await this.courseRepository.findOne({
      where: { courseId },
      relations: ['instructor']
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const context: NotificationContext = {
      courseId,
      courseTitle: course.title,
      instructorId: course.instructor?.user_id,
      rejectionReason,
      triggeredBy: reviewerId
    };

    return await this.createRuleBasedNotification(
      NotificationEvent.COURSE_REJECTED,
      context,
      [reviewerId] // Don't notify the reviewer who rejected
    );
  }

  /**
   * Flow 4: User enrolled in course
   */
  async notifyUserEnrolled(courseId: string, studentId: string, studentName: string): Promise<Notification> {
    const course = await this.courseRepository.findOne({ 
      where: { courseId },
      relations: ['instructor']
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const context: NotificationContext = {
      courseId,
      courseTitle: course.title,
      instructorId: course.instructor?.user_id,
      userId: studentId,
      studentName,
      triggeredBy: studentId
    };

    return await this.createRuleBasedNotification(
      NotificationEvent.USER_ENROLLED,
      context,
      [studentId] // Don't notify the student who enrolled
    );
  }

  /**
   * Flow 5: Support chat session created
   */
  async notifyChatSessionCreated(userId: string, userName: string, chatSessionId?: string): Promise<Notification> {
    const context: NotificationContext = {
      userId,
      userName,
      chatSessionId,
      triggeredBy: userId
    };

    return await this.createRuleBasedNotification(
      NotificationEvent.CHAT_SESSION_CREATED,
      context,
      [userId] // Don't notify the user who created the chat
    );
  }
}