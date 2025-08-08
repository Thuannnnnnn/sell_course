import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { NotificationService } from './notification.service';
import {
  NotificationType,
  NotificationPriority,
} from './enums/notification-type.enum';
import { UserRole } from '../Auth/user.enum';
import { CourseStatus } from '../course/enums/course-status.enum';

@Injectable()
export class CourseNotificationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    private notificationService: NotificationService,
  ) {}

  async notifyOnCourseCreated(course: Course): Promise<void> {
    // Lấy danh sách users cần thông báo - sử dụng format database
    const [courseReviewers, admins, contentManagers] = await Promise.all([
      this.getUsersByDatabaseRole('COURSEREVIEWER'),
      this.getUsersByDatabaseRole('ADMIN'),
      this.getUsersByDatabaseRole('CONTENTMANAGER'),
    ]);

    // Notify Course Reviewers
    if (courseReviewers.length > 0) {
      await this.notificationService.createNotification({
        title: 'New Course Needs Review',
        message: `Course "${course.title}" created by ${course.instructor.username} needs review.`,
        type: NotificationType.COURSE_REVIEW_REQUESTED,
        priority: NotificationPriority.HIGH,
        courseId: course.courseId,
        metadata: {
          courseTitle: course.title,
          instructorName: course.instructor.username,
          instructorId: course.instructor.user_id,
          categoryId: course.category?.categoryId,
          action: 'review_required',
        },
        recipientIds: courseReviewers.map((user) => user.user_id),
      });
    }

    // Notify Admins
    if (admins.length > 0) {
      await this.notificationService.createNotification({
        title: 'New Course Created',
        message: `${course.instructor.username} has created a new course "${course.title}".`,
        type: NotificationType.COURSE_CREATED,
        priority: NotificationPriority.MEDIUM,
        courseId: course.courseId,
        metadata: {
          courseTitle: course.title,
          instructorName: course.instructor.username,
          instructorId: course.instructor.user_id,
          categoryId: course.category?.categoryId,
          action: 'course_created',
        },
        recipientIds: admins.map((user) => user.user_id),
      });
    }

    // Notify Content Managers (if category exists)
    if (contentManagers.length > 0 && course.category) {
      await this.notificationService.createNotification({
        title: 'New Course in Managed Category',
        message: `Course "${course.title}" has been created in your managed category.`,
        type: NotificationType.COURSE_CREATED,
        priority: NotificationPriority.MEDIUM,
        courseId: course.courseId,
        metadata: {
          courseTitle: course.title,
          instructorName: course.instructor.username,
          instructorId: course.instructor.user_id,
          categoryId: course.category.categoryId,
          categoryName: course.category.name,
          action: 'content_management',
        },
        recipientIds: contentManagers.map((user) => user.user_id),
      });
    }

    console.log(
      `🎉 Completed notification process for course: ${course.title}`,
    );
  }

  async notifyOnCourseUpdated(
    course: Course,
    updatedFields: string[],
  ): Promise<void> {
    console.log(
      `🔄 Course updated notification for: ${course.title}, Status: ${course.status}`,
    );

    const updatedFieldsText = updatedFields.join(', ');

    // Nếu khóa học đã PUBLISHED - gửi cho enrolled users
    if (course.status === CourseStatus.PUBLISHED) {
      await this.notifyEnrolledUsersOnCourseUpdate(course, updatedFields);
      return;
    }

    // Nếu khóa học chưa PUBLISHED - gửi cho Course Reviewers và Admins
    const [courseReviewers, admins] = await Promise.all([
      this.getUsersByDatabaseRole('COURSEREVIEWER'),
      this.getUsersByDatabaseRole('ADMIN'),
    ]);

    // Notify Course Reviewers
    if (courseReviewers.length > 0) {
      await this.notificationService.createNotification({
        title: 'Course Updated - Review Required',
        message: `Course "${course.title}" has been updated (${updatedFieldsText}). Please review again.`,
        type: NotificationType.COURSE_UPDATED,
        priority: NotificationPriority.HIGH,
        courseId: course.courseId,
        metadata: {
          courseTitle: course.title,
          instructorName: course.instructor.username,
          instructorId: course.instructor.user_id,
          updatedFields,
          action: 'review_required',
        },
        recipientIds: courseReviewers.map((user) => user.user_id),
      });
    }

    // Notify Admins
    if (admins.length > 0) {
      await this.notificationService.createNotification({
        title: 'Course Updated',
        message: `Course "${course.title}" has been updated by ${course.instructor.username}.`,
        type: NotificationType.COURSE_UPDATED,
        priority: NotificationPriority.MEDIUM,
        courseId: course.courseId,
        metadata: {
          courseTitle: course.title,
          instructorName: course.instructor.username,
          instructorId: course.instructor.user_id,
          updatedFields,
          action: 'course_updated',
        },
        recipientIds: admins.map((user) => user.user_id),
      });
    }
  }

  async notifyOnCoursePublished(course: Course): Promise<void> {
    // Kiểm tra instructor có tồn tại không
    if (!course.instructor) {
      return;
    }

    // Notify instructor
    await this.notificationService.createNotification({
      title: 'Course Approved',
      message: `Congratulations! Your course "${course.title}" has been approved and published.`,
      type: NotificationType.COURSE_PUBLISHED,
      priority: NotificationPriority.HIGH,
      courseId: course.courseId,
      metadata: {
        courseTitle: course.title,
        action: 'course_published',
      },
      recipientIds: [course.instructor.user_id],
    });
  }

  async notifyOnCourseRejected(course: Course, reason: string): Promise<void> {
    // Kiểm tra instructor có tồn tại không
    if (!course.instructor) {
      return;
    }

    // Notify instructor
    await this.notificationService.createNotification({
      title: 'Course Rejected',
      message: `Your course "${course.title}" has been rejected. Reason: ${reason}`,
      type: NotificationType.COURSE_REJECTED,
      priority: NotificationPriority.HIGH,
      courseId: course.courseId,
      metadata: {
        courseTitle: course.title,
        rejectionReason: reason,
        action: 'course_rejected',
      },
      recipientIds: [course.instructor.user_id],
    });
  }

  /**
   * Gửi notification cho enrolled users khi published course được update
   * Flow 2: Enrolled Users Course Update Notification
   */
  private async notifyEnrolledUsersOnCourseUpdate(
    course: Course,
    updatedFields: string[],
  ): Promise<void> {
    console.log(
      `📢 Sending course update notifications to enrolled users for: ${course.title}`,
    );

    // Lấy tất cả users đã enrolled vào course này
    const enrollments = await this.enrollmentRepository.find({
      where: {
        course: { courseId: course.courseId },
        status: 'active', // Chỉ lấy enrollment đang active
      },
      relations: ['user'],
      select: {
        user: {
          user_id: true,
          username: true,
          email: true,
        },
      },
    });

    if (enrollments.length === 0) {
      return;
    }

    const enrolledUsers = enrollments.map((enrollment) => enrollment.user);
    const updatedFieldsText = updatedFields.join(', ');

    // Send notification to all enrolled users
    await this.notificationService.createNotification({
      title: 'Course Updated',
      message: `The course "${course.title}" you enrolled in has been updated: ${updatedFieldsText}. Check it out now!`,
      type: NotificationType.COURSE_UPDATED,
      priority: NotificationPriority.MEDIUM,
      courseId: course.courseId,
      metadata: {
        courseTitle: course.title,
        instructorName: course.instructor?.username || 'Unknown',
        instructorId: course.instructor?.user_id,
        updatedFields,
        action: 'enrolled_course_updated',
        courseStatus: course.status,
        enrolledUsersCount: enrolledUsers.length,
      },
      recipientIds: enrolledUsers.map((user) => user.user_id),
    });
  }

  private async getUsersByRole(role: UserRole): Promise<User[]> {
    const users = await this.userRepository.find({
      where: { role },
      select: ['user_id', 'username', 'email'],
    });
    return users;
  }

  private async getUsersByDatabaseRole(role: string): Promise<User[]> {
    const users = await this.userRepository.find({
      where: { role },
      select: ['user_id', 'username', 'email'],
    });
    return users;
  }
}
