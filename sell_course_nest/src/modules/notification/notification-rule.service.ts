import { Injectable, Logger } from '@nestjs/common';
import { UserRole } from '../Auth/user.enum';
import {
  NotificationType,
  NotificationPriority,
} from './enums/notification-type.enum';
import {
  NotificationEvent,
  NOTIFICATION_RULES,
  NotificationRule,
  ROLE_TO_DATABASE_STRING,
  TEMPLATE_VARIABLES,
} from './constants/notification.constants';

/**
 * Context data for notification rule processing
 */
export interface NotificationContext {
  // Course related context
  courseId?: string;
  courseTitle?: string;
  instructorId?: string;
  instructorName?: string;

  // User related context
  userId?: string;
  userName?: string;
  studentName?: string;

  // Additional context
  rejectionReason?: string;
  maintenanceDetails?: string;
  chatSessionId?: string;
  messageText?: string;

  // Metadata
  triggeredBy?: string; // User ID who triggered the event
}

/**
 * Result of rule processing
 */
export interface NotificationRuleResult {
  recipients: UserRole[];
  title: string;
  message: string;
  notificationType: NotificationType;
  priority: NotificationPriority;
  databaseRoles: string[]; // For compatibility with existing getUsersByDatabaseRole
}

@Injectable()
export class NotificationRuleService {
  private readonly logger = new Logger(NotificationRuleService.name);

  /**
   * Process notification event and return rule-based result
   */
  async processNotificationEvent(
    event: NotificationEvent,
    context: NotificationContext,
  ): Promise<NotificationRuleResult> {
    this.logger.debug(`Processing notification event: ${event}`);

    // Get rule for this event
    const rule = this.getRule(event);
    if (!rule) {
      throw new Error(`No notification rule defined for event: ${event}`);
    }

    // Resolve recipients
    const recipients = await this.resolveRecipients(event, context);

    // Generate templated content
    const title = this.interpolateTemplate(rule.titleTemplate, context);
    const message = this.interpolateTemplate(rule.messageTemplate, context);

    // Convert to database role strings
    const databaseRoles = this.convertRolesToDatabaseStrings(recipients);

    return {
      recipients,
      title,
      message,
      notificationType: rule.notificationType,
      priority: rule.priority,
      databaseRoles,
    };
  }

  /**
   * Get notification rule for event
   */
  getRule(event: NotificationEvent): NotificationRule | null {
    const rule = NOTIFICATION_RULES[event];
    if (!rule) {
      this.logger.warn(`No rule found for event: ${event}`);
      return null;
    }
    return rule;
  }

  /**
   * Resolve recipients for notification based on event and context
   */
  async resolveRecipients(
    event: NotificationEvent,
    context: NotificationContext,
  ): Promise<UserRole[]> {
    const rule = this.getRule(event);
    if (!rule) {
      return [];
    }

    const recipients = [...rule.recipients];

    // Apply context-specific logic for recipient filtering
    switch (event) {
      case NotificationEvent.COURSE_SUBMITTED_FOR_REVIEW:
      case NotificationEvent.COURSE_PUBLISHED:
      case NotificationEvent.COURSE_REJECTED:
      case NotificationEvent.COURSE_UPDATED:
        // For course events, recipients are static as defined in rules
        break;

      case NotificationEvent.USER_ENROLLED:
        // For enrollment, notify the specific course instructor
        // Note: In real implementation, you might want to filter by course ownership
        break;

      case NotificationEvent.CHAT_SESSION_CREATED:
        // For support requests, notify all support staff
        break;

      case NotificationEvent.SYSTEM_MAINTENANCE:
        // System maintenance notifications go to all admins
        break;

      default:
        this.logger.warn(
          `Unhandled event type for recipient resolution: ${event}`,
        );
    }

    // Filter out the user who triggered the event (avoid self-notification)
    // This would require more complex logic based on your business rules

    this.logger.debug(`Resolved recipients for ${event}:`, recipients);
    return recipients;
  }

  /**
   * Generate notification title with template interpolation
   */
  getNotificationTitle(
    event: NotificationEvent,
    context: NotificationContext,
  ): string {
    const rule = this.getRule(event);
    if (!rule) {
      return 'Notification';
    }

    return this.interpolateTemplate(rule.titleTemplate, context);
  }

  /**
   * Generate notification message with template interpolation
   */
  getNotificationMessage(
    event: NotificationEvent,
    context: NotificationContext,
  ): string {
    const rule = this.getRule(event);
    if (!rule) {
      return '';
    }

    return this.interpolateTemplate(rule.messageTemplate, context);
  }

  /**
   * Validate if notification rule exists for event
   */
  validateRule(event: NotificationEvent): boolean {
    return Boolean(NOTIFICATION_RULES[event]);
  }

  /**
   * Get all available events that have rules
   */
  getAvailableEvents(): NotificationEvent[] {
    return Object.keys(NOTIFICATION_RULES) as NotificationEvent[];
  }

  /**
   * Convert UserRole array to database role strings for compatibility
   */
  private convertRolesToDatabaseStrings(roles: UserRole[]): string[] {
    return roles.map((role) => ROLE_TO_DATABASE_STRING[role]).filter(Boolean);
  }

  /**
   * Interpolate template with context data
   */
  private interpolateTemplate(
    template: string,
    context: NotificationContext,
  ): string {
    let result = template;

    // Replace all template variables with context values
    const replacements: Record<string, string | undefined> = {
      [TEMPLATE_VARIABLES.courseTitle]: context.courseTitle,
      [TEMPLATE_VARIABLES.instructorName]: context.instructorName,
      [TEMPLATE_VARIABLES.studentName]: context.studentName,
      [TEMPLATE_VARIABLES.userName]: context.userName,
      [TEMPLATE_VARIABLES.rejectionReason]: context.rejectionReason,
      [TEMPLATE_VARIABLES.maintenanceDetails]: context.maintenanceDetails,
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      if (value !== undefined) {
        result = result.replace(
          new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
          value,
        );
      }
    }

    // Log warning for unresolved placeholders
    const unresolvedPlaceholders = result.match(/\{[^}]+\}/g);
    if (unresolvedPlaceholders) {
      this.logger.warn(
        `Unresolved template placeholders:`,
        unresolvedPlaceholders,
      );
    }

    return result;
  }

  /**
   * Get notification context template for specific event (helper for API documentation)
   */
  getContextTemplate(event: NotificationEvent): Partial<NotificationContext> {
    switch (event) {
      case NotificationEvent.COURSE_SUBMITTED_FOR_REVIEW:
      case NotificationEvent.COURSE_PUBLISHED:
      case NotificationEvent.COURSE_UPDATED:
        return {
          courseId: 'uuid-string',
          courseTitle: 'string',
          instructorId: 'uuid-string',
          instructorName: 'string',
          triggeredBy: 'uuid-string',
        };

      case NotificationEvent.COURSE_REJECTED:
        return {
          courseId: 'uuid-string',
          courseTitle: 'string',
          instructorId: 'uuid-string',
          rejectionReason: 'string',
          triggeredBy: 'uuid-string',
        };

      case NotificationEvent.USER_ENROLLED:
        return {
          courseId: 'uuid-string',
          courseTitle: 'string',
          instructorId: 'uuid-string',
          userId: 'uuid-string',
          studentName: 'string',
          triggeredBy: 'uuid-string',
        };

      case NotificationEvent.CHAT_SESSION_CREATED:
        return {
          userId: 'uuid-string',
          userName: 'string',
          chatSessionId: 'uuid-string',
          triggeredBy: 'uuid-string',
        };

      case NotificationEvent.SYSTEM_MAINTENANCE:
        return {
          maintenanceDetails: 'string',
          triggeredBy: 'uuid-string',
        };

      default:
        return {};
    }
  }
}
