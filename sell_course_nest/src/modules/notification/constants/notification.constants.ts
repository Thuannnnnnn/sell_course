import { NotificationType, NotificationPriority } from '../enums/notification-type.enum';
import { UserRole } from '../../Auth/user.enum';

/**
 * Notification Events - Business events that trigger notifications
 */
export enum NotificationEvent {
  // Course related events
  COURSE_SUBMITTED_FOR_REVIEW = 'COURSE_SUBMITTED_FOR_REVIEW',
  COURSE_PUBLISHED = 'COURSE_PUBLISHED', 
  COURSE_REJECTED = 'COURSE_REJECTED',
  COURSE_UPDATED = 'COURSE_UPDATED',
  
  // Enrollment related events
  USER_ENROLLED = 'USER_ENROLLED',
  
  // Support related events
  CHAT_SESSION_CREATED = 'CHAT_SESSION_CREATED',
  CHAT_MESSAGE_RECEIVED = 'CHAT_MESSAGE_RECEIVED',
  
  // General events
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
}

/**
 * Notification Rule - Defines who should receive notification for each event
 */
export interface NotificationRule {
  event: NotificationEvent;
  recipients: UserRole[];
  notificationType: NotificationType;
  priority: NotificationPriority;
  titleTemplate: string;
  messageTemplate: string;
}

/**
 * Notification Rules Mapping - Central configuration for all notification flows
 */
export const NOTIFICATION_RULES: Record<NotificationEvent, NotificationRule> = {
  // Flow 1: Instructor → CourseReviewer 
  [NotificationEvent.COURSE_SUBMITTED_FOR_REVIEW]: {
    event: NotificationEvent.COURSE_SUBMITTED_FOR_REVIEW,
    recipients: [UserRole.COURSEREVIEWER],
    notificationType: NotificationType.COURSE_REVIEW_REQUESTED,
    priority: NotificationPriority.HIGH,
    titleTemplate: 'New Course Needs Review',
    messageTemplate: 'Course "{courseTitle}" by {instructorName} needs review.',
  },

  // Flow 2: CourseReviewer Accept → Instructor + Admin + Marketing
  [NotificationEvent.COURSE_PUBLISHED]: {
    event: NotificationEvent.COURSE_PUBLISHED,
    recipients: [UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.MARKETINGMANAGER],
    notificationType: NotificationType.COURSE_PUBLISHED,
    priority: NotificationPriority.HIGH,
    titleTemplate: 'Course Published Successfully',
    messageTemplate: 'Course "{courseTitle}" has been approved and published.',
  },

  // Flow 3: CourseReviewer Reject → Instructor
  [NotificationEvent.COURSE_REJECTED]: {
    event: NotificationEvent.COURSE_REJECTED,
    recipients: [UserRole.INSTRUCTOR],
    notificationType: NotificationType.COURSE_REJECTED,
    priority: NotificationPriority.HIGH,
    titleTemplate: 'Course Rejected',
    messageTemplate: 'Your course "{courseTitle}" has been rejected. Reason: {rejectionReason}',
  },

  // Flow 4: User buy course → Instructor
  [NotificationEvent.USER_ENROLLED]: {
    event: NotificationEvent.USER_ENROLLED,
    recipients: [UserRole.INSTRUCTOR],
    notificationType: NotificationType.ENROLLMENT_CREATED,
    priority: NotificationPriority.MEDIUM,
    titleTemplate: 'New Student Enrolled',
    messageTemplate: 'Student {studentName} has enrolled in your course "{courseTitle}".',
  },

  // Flow 5: User create chat → Support
  [NotificationEvent.CHAT_SESSION_CREATED]: {
    event: NotificationEvent.CHAT_SESSION_CREATED,
    recipients: [UserRole.SUPPORT],
    notificationType: NotificationType.SUPPORT_REQUEST_CREATED,
    priority: NotificationPriority.MEDIUM,
    titleTemplate: 'New Support Chat Request',
    messageTemplate: 'User {userName} has created a new support chat session.',
  },

  // Flow 6: User send message in chat → Support
  [NotificationEvent.CHAT_MESSAGE_RECEIVED]: {
    event: NotificationEvent.CHAT_MESSAGE_RECEIVED,
    recipients: [UserRole.SUPPORT, UserRole.ADMIN],
    notificationType: NotificationType.SUPPORT_REQUEST_CREATED,
    priority: NotificationPriority.MEDIUM,
    titleTemplate: 'New Chat Message',
    messageTemplate: 'User {userName} sent a message: "{messageText}"',
  },

  // Additional rule for course updates
  [NotificationEvent.COURSE_UPDATED]: {
    event: NotificationEvent.COURSE_UPDATED,
    recipients: [UserRole.COURSEREVIEWER, UserRole.ADMIN],
    notificationType: NotificationType.COURSE_UPDATED,
    priority: NotificationPriority.MEDIUM,
    titleTemplate: 'Course Updated',
    messageTemplate: 'Course "{courseTitle}" has been updated and may need re-review.',
  },

  // System maintenance (using existing type)
  [NotificationEvent.SYSTEM_MAINTENANCE]: {
    event: NotificationEvent.SYSTEM_MAINTENANCE,
    recipients: [UserRole.ADMIN],
    notificationType: NotificationType.COURSE_CREATED,
    priority: NotificationPriority.URGENT,
    titleTemplate: 'System Maintenance Required',
    messageTemplate: 'System maintenance notification: {maintenanceDetails}',
  },
};

/**
 * Template variable patterns for string interpolation
 */
export const TEMPLATE_VARIABLES = {
  courseTitle: '{courseTitle}',
  instructorName: '{instructorName}',
  studentName: '{studentName}',
  userName: '{userName}',
  messageText: '{messageText}',
  rejectionReason: '{rejectionReason}',
  maintenanceDetails: '{maintenanceDetails}',
} as const;

/**
 * Role to database string mapping (for existing getUsersByDatabaseRole compatibility)
 */
export const ROLE_TO_DATABASE_STRING: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Admin',
  [UserRole.INSTRUCTOR]: 'Instructor', 
  [UserRole.USER]: 'User',
  [UserRole.COURSEREVIEWER]: 'Course Reviewer',
  [UserRole.SUPPORT]: 'Support',
  [UserRole.CONTENTMANAGER]: 'Content Manager',
  [UserRole.MARKETINGMANAGER]: 'Marketing Manager',
};