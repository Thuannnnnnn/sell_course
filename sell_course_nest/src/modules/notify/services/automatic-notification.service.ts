import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotifyService } from '../notify.service';
import { Course } from '../../course/entities/course.entity';
import { User } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';
import { NotificationType, UserRole } from '../constants/notification.constants';
import { CreateNotifyDto } from '../dto/notify.dto';

@Injectable()
export class AutomaticNotificationService {
  constructor(
    private readonly notifyService: NotifyService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Gửi thông báo tự động khi instructor tạo khóa học mới
   */
  async handleCourseCreated(courseId: string): Promise<void> {
    try {
      // Lấy thông tin khóa học với instructor và category
      const course = await this.courseRepository.findOne({
        where: { courseId },
        relations: ['instructor', 'category'],
      });

      if (!course) {
        throw new Error(`Course with ID ${courseId} not found`);
      }

      // 1. Thông báo cho CourseReviewer: "Khóa học mới cần review"
      await this.sendNotificationToCourseReviewers(course);

      // 2. Thông báo cho Admin: "Khóa học mới được tạo"
      await this.sendNotificationToAdmins(course);

      // 3. Thông báo cho Content Manager: "Khóa học mới trong category [X]"
      await this.sendNotificationToContentManagers(course);

    } catch (error) {
      console.error('Error in handleCourseCreated:', error);
      throw error;
    }
  }

  /**
   * Gửi thông báo tự động khi instructor cập nhật khóa học
   */
  async handleCourseUpdated(courseId: string): Promise<void> {
    try {
      // Lấy thông tin khóa học với instructor và category
      const course = await this.courseRepository.findOne({
        where: { courseId },
        relations: ['instructor', 'category'],
      });

      if (!course) {
        throw new Error(`Course with ID ${courseId} not found`);
      }

      // 1. Thông báo cho CourseReviewer: "Khóa học đã được chỉnh sửa, cần review lại"
      await this.sendUpdateNotificationToCourseReviewers(course);

      // 2. Thông báo cho Admin: "Khóa học [X] đã được cập nhật"
      await this.sendUpdateNotificationToAdmins(course);

    } catch (error) {
      console.error('Error in handleCourseUpdated:', error);
      throw error;
    }
  }

  /**
   * Gửi thông báo cho CourseReviewers khi có khóa học mới
   */
  private async sendNotificationToCourseReviewers(course: Course): Promise<void> {
    try {
      const notificationData: CreateNotifyDto = {
        title: '📚 Khóa học mới cần review',
        message: `Khóa học "${course.title}" của giảng viên ${course.instructor.username} cần được review. Vui lòng kiểm tra và phê duyệt.`,
        type: NotificationType.COURSE_REVIEWER,
      };

      await this.notifyService.create(notificationData);
      console.log(`✅ Notification sent to CourseReviewers for course: ${course.title}`);
    } catch (error) {
      console.error('❌ Error sending notification to CourseReviewers');
      // Không throw error để không ảnh hưởng đến flow chính
    }
  }

  /**
   * Gửi thông báo cho Admins khi có khóa học mới
   */
  private async sendNotificationToAdmins(course: Course): Promise<void> {
    try {
      const notificationData: CreateNotifyDto = {
        title: '🎓 Khóa học mới được tạo',
        message: `Khóa học "${course.title}" đã được tạo bởi giảng viên ${course.instructor.username} trong danh mục ${course.category.name}.`,
        type: NotificationType.ADMIN,
      };

      await this.notifyService.create(notificationData);
      console.log(`✅ Notification sent to Admins for course: ${course.title}`);
    } catch (error) {
      console.error('❌ Error sending notification to Admins:');
    }
  }

  /**
   * Gửi thông báo cho Content Managers khi có khóa học mới trong category
   */
  private async sendNotificationToContentManagers(course: Course): Promise<void> {
    try {
      const notificationData: CreateNotifyDto = {
        title: `📂 Khóa học mới trong danh mục ${course.category.name}`,
        message: `Khóa học "${course.title}" đã được thêm vào danh mục ${course.category.name}. Vui lòng kiểm tra nội dung và cấu trúc khóa học.`,
        type: NotificationType.CONTENT_MANAGER,
      };

      await this.notifyService.create(notificationData);
      console.log(`✅ Notification sent to Content Managers for course: ${course.title}`);
    } catch (error) {
      console.error('❌ Error sending notification to Content Managers:');
    }
  }

  /**
   * Gửi thông báo cập nhật cho CourseReviewers
   */
  private async sendUpdateNotificationToCourseReviewers(course: Course): Promise<void> {
    try {
      const notificationData: CreateNotifyDto = {
        title: '🔄 Khóa học đã được chỉnh sửa',
        message: `Khóa học "${course.title}" đã được cập nhật bởi giảng viên ${course.instructor.username}. Vui lòng review lại các thay đổi.`,
        type: NotificationType.COURSE_REVIEWER,
      };

      await this.notifyService.create(notificationData);
      console.log(`✅ Update notification sent to CourseReviewers for course: ${course.title}`);
    } catch (error) {
      console.error('❌ Error sending update notification to CourseReviewers:');
    }
  }

  /**
   * Gửi thông báo cập nhật cho Admins
   */
  private async sendUpdateNotificationToAdmins(course: Course): Promise<void> {
    try {
      const notificationData: CreateNotifyDto = {
        title: '✏️ Khóa học đã được cập nhật',
        message: `Khóa học "${course.title}" đã được cập nhật bởi giảng viên ${course.instructor.username}. Thời gian cập nhật: ${new Date().toLocaleString('vi-VN')}.`,
        type: NotificationType.ADMIN,
      };

      await this.notifyService.create(notificationData);
      console.log(`✅ Update notification sent to Admins for course: ${course.title}`);
    } catch (error) {
      console.error('❌ Error sending update notification to Admins:');
    }
  }

  /**
   * Lấy danh sách users theo role
   */
  private async getUsersByRole(role: UserRole): Promise<User[]> {
    return await this.userRepository.find({
      where: { role: role },
    });
  }

  /**
   * Kiểm tra xem có users nào với role cụ thể không
   */
  private async hasUsersWithRole(role: UserRole): Promise<boolean> {
    const count = await this.userRepository.count({
      where: { role: role },
    });
    return count > 0;
  }
}