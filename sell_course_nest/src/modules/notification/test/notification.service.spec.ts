import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from '../notification.service';
import { NotificationRuleService } from '../notification-rule.service';
import { Notification } from '../entities/notification.entity';
import { UserNotification } from '../entities/user-notification.entity';
import { User } from '../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';
import { NotificationType, NotificationPriority, NotificationStatus } from '../enums/notification-type.enum';

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationRepository: Repository<Notification>;
  let userNotificationRepository: Repository<UserNotification>;
  let userRepository: Repository<User>;
  let courseRepository: Repository<Course>;

  const mockNotificationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockUserNotificationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockCourseRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
        {
          provide: getRepositoryToken(UserNotification),
          useValue: mockUserNotificationRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    notificationRepository = module.get<Repository<Notification>>(getRepositoryToken(Notification));
    userNotificationRepository = module.get<Repository<UserNotification>>(getRepositoryToken(UserNotification));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    courseRepository = module.get<Repository<Course>>(getRepositoryToken(Course));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a notification successfully', async () => {
      const createNotificationDto = {
        title: 'Test Notification',
        message: 'Test message',
        type: NotificationType.COURSE_CREATED,
        priority: NotificationPriority.MEDIUM,
        recipientIds: ['user1', 'user2'],
      };

      const mockNotification = {
        id: 'notification1',
        title: 'Test Notification',
        message: 'Test message',
        type: NotificationType.COURSE_CREATED,
        priority: NotificationPriority.MEDIUM,
        createdAt: new Date(),
      };

      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);
      mockUserNotificationRepository.create.mockReturnValue({});
      mockUserNotificationRepository.save.mockResolvedValue([]);

      const result = await service.createNotification(createNotificationDto);

      expect(mockNotificationRepository.create).toHaveBeenCalledWith({
        title: 'Test Notification',
        message: 'Test message',
        type: NotificationType.COURSE_CREATED,
        priority: NotificationPriority.MEDIUM,
      });
      expect(mockNotificationRepository.save).toHaveBeenCalledWith(mockNotification);
      expect(result).toEqual(mockNotification);
    });

    it('should create notification with course reference', async () => {
      const createNotificationDto = {
        title: 'Course Notification',
        message: 'Course message',
        type: NotificationType.COURSE_CREATED,
        courseId: 'course1',
        recipientIds: ['user1'],
      };

      const mockCourse = {
        courseId: 'course1',
        title: 'Test Course',
      };

      const mockNotification = {
        id: 'notification1',
        title: 'Course Notification',
        message: 'Course message',
        type: NotificationType.COURSE_CREATED,
        course: mockCourse,
      };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);
      mockUserNotificationRepository.create.mockReturnValue({});
      mockUserNotificationRepository.save.mockResolvedValue([]);

      const result = await service.createNotification(createNotificationDto);

      expect(mockCourseRepository.findOne).toHaveBeenCalledWith({ where: { courseId: 'course1' } });
      expect(result.course).toEqual(mockCourse);
    });
  });

  describe('getUserNotifications', () => {
    it('should return user notifications with pagination', async () => {
      const userId = 'user1';
      const mockUserNotifications = [
        {
          notification: {
            id: 'notification1',
            title: 'Test Notification',
            message: 'Test message',
            type: NotificationType.COURSE_CREATED,
            priority: NotificationPriority.MEDIUM,
            createdAt: new Date(),
          },
          status: NotificationStatus.UNREAD,
          readAt: null,
        },
      ];

      mockUserNotificationRepository.findAndCount.mockResolvedValue([mockUserNotifications, 1]);
      mockUserNotificationRepository.count.mockResolvedValue(1);

      const result = await service.getUserNotifications(userId, 1, 20);

      expect(mockUserNotificationRepository.findAndCount).toHaveBeenCalledWith({
        where: { user: { user_id: userId } },
        relations: [
          'notification',
          'notification.course',
          'notification.course.instructor',
          'notification.createdBy',
        ],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });

      expect(result.notifications).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.unreadCount).toBe(1);
    });
  });

  describe('markNotification', () => {
    it('should mark notification as read', async () => {
      const userId = 'user1';
      const notificationId = 'notification1';
      const mockUserNotification = {
        id: 'userNotification1',
        status: NotificationStatus.UNREAD,
        readAt: null,
      };

      mockUserNotificationRepository.findOne.mockResolvedValue(mockUserNotification);
      mockUserNotificationRepository.save.mockResolvedValue({
        ...mockUserNotification,
        status: NotificationStatus.READ,
        readAt: expect.any(Date),
      });

      await service.markNotification(userId, {
        notificationId,
        status: NotificationStatus.READ,
      });

      expect(mockUserNotificationRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { user_id: userId },
          notification: { id: notificationId },
        },
      });

      expect(mockUserNotificationRepository.save).toHaveBeenCalledWith({
        ...mockUserNotification,
        status: NotificationStatus.READ,
        readAt: expect.any(Date),
      });
    });

    it('should throw NotFoundException when notification not found', async () => {
      const userId = 'user1';
      const notificationId = 'nonexistent';

      mockUserNotificationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.markNotification(userId, {
          notificationId,
          status: NotificationStatus.READ,
        })
      ).rejects.toThrow('Notification not found');
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      const userId = 'user1';
      mockUserNotificationRepository.count.mockResolvedValue(5);

      const result = await service.getUnreadCount(userId);

      expect(mockUserNotificationRepository.count).toHaveBeenCalledWith({
        where: {
          user: { user_id: userId },
          status: NotificationStatus.UNREAD,
        },
      });

      expect(result).toBe(5);
    });
  });
});