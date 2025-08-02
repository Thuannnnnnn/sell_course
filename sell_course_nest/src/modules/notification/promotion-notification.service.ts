import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { Promotion } from '../promotion/entities/promotion.entity';
import { NotificationService } from './notification.service';
import { NotificationType, NotificationPriority } from './enums/notification-type.enum';

@Injectable()
export class PromotionNotificationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private notificationService: NotificationService,
  ) {}

  /**
   * Gửi notification khi Content Manager tạo Promotion cho một Course cụ thể
   * Workflow: Content Manager -> create Promotion -> notify Instructor & Marketing Manager
   */
  async notifyOnPromotionCreated(promotion: Promotion, createdBy: User): Promise<void> {
    console.log(`🎯 Starting promotion notification workflow for: ${promotion.name}`);

    // Lấy thông tin course với instructor
    const course = await this.courseRepository.findOne({
      where: { courseId: promotion.course.courseId },
      relations: ['instructor'],
    });

    if (!course || !course.instructor) {
      console.error(`❌ Course or instructor not found for promotion: ${promotion.name}`);
      return;
    }

    // Lấy danh sách Marketing Managers
    const marketingManagers = await this.getUsersByRole('MARKETINGMANAGER');

    // Tạo danh sách recipients
    const recipients: string[] = [];
    
    // Thêm Instructor sở hữu course
    recipients.push(course.instructor.user_id);
    
    // Thêm Marketing Managers
    recipients.push(...marketingManagers.map(user => user.user_id));

    // Loại bỏ duplicate nếu có (trường hợp instructor cũng là marketing manager)
    const uniqueRecipients = [...new Set(recipients)];

    if (uniqueRecipients.length === 0) {
      console.warn(`⚠️ No recipients found for promotion notification: ${promotion.name}`);
      return;
    }

    // Tạo notification
    await this.notificationService.createNotification({
      title: 'New Promotion Created',
      message: `A new promotion "${promotion.name}" (${promotion.discount}% off) has been created for course "${course.title}". Promotion code: ${promotion.code}`,
      type: NotificationType.PROMOTION_CREATED,
      priority: NotificationPriority.HIGH,
      courseId: course.courseId,
      createdBy: createdBy.user_id,
      metadata: {
        promotionId: promotion.id,
        promotionName: promotion.name,
        promotionCode: promotion.code,
        discount: promotion.discount,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        courseTitle: course.title,
        courseId: course.courseId,
        instructorId: course.instructor.user_id,
        instructorName: course.instructor.username,
        createdByName: createdBy.username,
        createdByRole: createdBy.role,
        action: 'promotion_created',
        targetAudience: {
          instructor: course.instructor.user_id,
          marketingManagers: marketingManagers.map(user => user.user_id),
        },
      },
      recipientIds: uniqueRecipients,
    });

    // Gửi notification riêng cho Instructor với nội dung cá nhân hóa
    await this.notificationService.createNotification({
      title: 'Promotion Created for Your Course',
      message: `Great news! A promotion "${promotion.name}" with ${promotion.discount}% discount has been created for your course "${course.title}". This will help boost your course sales!`,
      type: NotificationType.PROMOTION_CREATED,
      priority: NotificationPriority.HIGH,
      courseId: course.courseId,
      createdBy: createdBy.user_id,
      metadata: {
        promotionId: promotion.id,
        promotionName: promotion.name,
        promotionCode: promotion.code,
        discount: promotion.discount,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        courseTitle: course.title,
        courseId: course.courseId,
        createdByName: createdBy.username,
        createdByRole: createdBy.role,
        action: 'promotion_created_for_instructor',
        personalizedMessage: true,
      },
      recipientIds: [course.instructor.user_id],
    });

    // Gửi notification riêng cho Marketing Managers với nội dung chuyên biệt
    if (marketingManagers.length > 0) {
      await this.notificationService.createNotification({
        title: 'New Promotion Available for Marketing',
        message: `New promotion "${promotion.name}" (${promotion.discount}% off) is now available for course "${course.title}". Ready for marketing campaigns and sales promotion!`,
        type: NotificationType.PROMOTION_CREATED,
        priority: NotificationPriority.HIGH,
        courseId: course.courseId,
        createdBy: createdBy.user_id,
        metadata: {
          promotionId: promotion.id,
          promotionName: promotion.name,
          promotionCode: promotion.code,
          discount: promotion.discount,
          startDate: promotion.startDate,
          endDate: promotion.endDate,
          courseTitle: course.title,
          courseId: course.courseId,
          instructorId: course.instructor.user_id,
          instructorName: course.instructor.username,
          createdByName: createdBy.username,
          createdByRole: createdBy.role,
          action: 'promotion_created_for_marketing',
          marketingFocus: true,
          suggestedActions: [
            'Create marketing campaigns',
            'Update promotional materials',
            'Notify sales team',
            'Schedule social media posts',
          ],
        },
        recipientIds: marketingManagers.map(user => user.user_id),
      });
    }

    console.log(`✅ Promotion notification sent successfully for: ${promotion.name}`);
    console.log(`📊 Recipients: Instructor (${course.instructor.username}), Marketing Managers (${marketingManagers.length})`);
  }

  /**
   * Gửi notification khi Promotion được cập nhật
   */
  async notifyOnPromotionUpdated(promotion: Promotion, updatedBy: User, updatedFields: string[]): Promise<void> {
    console.log(`🔄 Promotion updated notification for: ${promotion.name}`);

    const course = await this.courseRepository.findOne({
      where: { courseId: promotion.course.courseId },
      relations: ['instructor'],
    });

    if (!course || !course.instructor) {
      return;
    }

    const marketingManagers = await this.getUsersByRole('MARKETINGMANAGER');
    const recipients = [
      course.instructor.user_id,
      ...marketingManagers.map(user => user.user_id),
    ];
    const uniqueRecipients = [...new Set(recipients)];

    const updatedFieldsText = updatedFields.join(', ');

    await this.notificationService.createNotification({
      title: 'Promotion Updated',
      message: `Promotion "${promotion.name}" for course "${course.title}" has been updated. Changes: ${updatedFieldsText}`,
      type: NotificationType.PROMOTION_UPDATED,
      priority: NotificationPriority.MEDIUM,
      courseId: course.courseId,
      createdBy: updatedBy.user_id,
      metadata: {
        promotionId: promotion.id,
        promotionName: promotion.name,
        promotionCode: promotion.code,
        discount: promotion.discount,
        courseTitle: course.title,
        courseId: course.courseId,
        instructorId: course.instructor.user_id,
        instructorName: course.instructor.username,
        updatedByName: updatedBy.username,
        updatedByRole: updatedBy.role,
        updatedFields,
        action: 'promotion_updated',
      },
      recipientIds: uniqueRecipients,
    });
  }

  /**
   * Gửi notification khi Promotion bị xóa
   */
  async notifyOnPromotionDeleted(promotion: Promotion, deletedBy: User): Promise<void> {
    console.log(`🗑️ Promotion deleted notification for: ${promotion.name}`);

    const course = await this.courseRepository.findOne({
      where: { courseId: promotion.course.courseId },
      relations: ['instructor'],
    });

    if (!course || !course.instructor) {
      return;
    }

    const marketingManagers = await this.getUsersByRole('MARKETINGMANAGER');
    const recipients = [
      course.instructor.user_id,
      ...marketingManagers.map(user => user.user_id),
    ];
    const uniqueRecipients = [...new Set(recipients)];

    await this.notificationService.createNotification({
      title: 'Promotion Deleted',
      message: `Promotion "${promotion.name}" for course "${course.title}" has been deleted. Please update your marketing materials accordingly.`,
      type: NotificationType.PROMOTION_DELETED,
      priority: NotificationPriority.HIGH,
      courseId: course.courseId,
      createdBy: deletedBy.user_id,
      metadata: {
        promotionId: promotion.id,
        promotionName: promotion.name,
        promotionCode: promotion.code,
        discount: promotion.discount,
        courseTitle: course.title,
        courseId: course.courseId,
        instructorId: course.instructor.user_id,
        instructorName: course.instructor.username,
        deletedByName: deletedBy.username,
        deletedByRole: deletedBy.role,
        action: 'promotion_deleted',
        urgentAction: 'Update marketing materials and remove promotion references',
      },
      recipientIds: uniqueRecipients,
    });
  }

  /**
   * Gửi notification khi Promotion sắp hết hạn (có thể chạy bằng cron job)
   */
  async notifyOnPromotionExpiring(promotion: Promotion, daysUntilExpiry: number): Promise<void> {
    console.log(`⏰ Promotion expiring notification for: ${promotion.name} (${daysUntilExpiry} days left)`);

    const course = await this.courseRepository.findOne({
      where: { courseId: promotion.course.courseId },
      relations: ['instructor'],
    });

    if (!course || !course.instructor) {
      return;
    }

    const marketingManagers = await this.getUsersByRole('MARKETINGMANAGER');
    const recipients = [
      course.instructor.user_id,
      ...marketingManagers.map(user => user.user_id),
    ];
    const uniqueRecipients = [...new Set(recipients)];

    const urgencyLevel = daysUntilExpiry <= 1 ? NotificationPriority.URGENT : 
                        daysUntilExpiry <= 3 ? NotificationPriority.HIGH : 
                        NotificationPriority.MEDIUM;

    await this.notificationService.createNotification({
      title: `Promotion Expiring Soon`,
      message: `Promotion "${promotion.name}" for course "${course.title}" will expire in ${daysUntilExpiry} day(s). Consider extending or creating a new promotion.`,
      type: NotificationType.PROMOTION_EXPIRED,
      priority: urgencyLevel,
      courseId: course.courseId,
      metadata: {
        promotionId: promotion.id,
        promotionName: promotion.name,
        promotionCode: promotion.code,
        discount: promotion.discount,
        endDate: promotion.endDate,
        daysUntilExpiry,
        courseTitle: course.title,
        courseId: course.courseId,
        instructorId: course.instructor.user_id,
        instructorName: course.instructor.username,
        action: 'promotion_expiring',
        suggestedActions: [
          'Extend promotion period',
          'Create new promotion',
          'Final marketing push',
          'Notify customers about expiry',
        ],
      },
      recipientIds: uniqueRecipients,
    });
  }

  /**
   * Lấy danh sách users theo role
   */
  private async getUsersByRole(role: string): Promise<User[]> {
    const users = await this.userRepository.find({
      where: { role },
      select: ['user_id', 'username', 'email', 'role'],
    });
    return users;
  }

  /**
   * Lấy thông tin course với instructor
   */
  private async getCourseWithInstructor(courseId: string): Promise<Course | null> {
    return this.courseRepository.findOne({
      where: { courseId },
      relations: ['instructor'],
    });
  }
}