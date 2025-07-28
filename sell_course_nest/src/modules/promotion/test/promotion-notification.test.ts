import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromotionNotificationService } from '../../notification/promotion-notification.service';
import { NotificationService } from '../../notification/notification.service';
import { User } from '../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';
import { Promotion } from '../entities/promotion.entity';
import { NotificationType, NotificationPriority } from '../../notification/enums/notification-type.enum';

describe('PromotionNotificationService', () => {
  let service: PromotionNotificationService;
  let userRepository: Repository<User>;
  let courseRepository: Repository<Course>;
  let notificationService: NotificationService;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockCourseRepository = {
    findOne: jest.fn(),
  };

  const mockNotificationService = {
    createNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionNotificationService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRepository,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<PromotionNotificationService>(PromotionNotificationService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    courseRepository = module.get<Repository<Course>>(getRepositoryToken(Course));
    notificationService = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('notifyOnPromotionCreated', () => {
    it('should send notifications to instructor and marketing managers', async () => {
      // Arrange
      const mockInstructor: User = {
        user_id: 'instructor-1',
        username: 'John Instructor',
        email: 'instructor@test.com',
        role: 'instructor',
      } as User;

      const mockCourse: Course = {
        courseId: 'course-1',
        title: 'Test Course',
        instructor: mockInstructor,
      } as Course;

      const mockPromotion: Promotion = {
        id: 'promotion-1',
        name: 'Summer Sale',
        code: 'SUMMER2024',
        discount: 20,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        course: mockCourse,
      } as Promotion;

      const mockContentManager: User = {
        user_id: 'content-manager-1',
        username: 'Jane Manager',
        email: 'manager@test.com',
        role: 'Content Manager',
      } as User;

      const mockMarketingManagers: User[] = [
        {
          user_id: 'marketing-1',
          username: 'Marketing User 1',
          email: 'marketing1@test.com',
          role: 'Marketing Manager',
        } as User,
        {
          user_id: 'marketing-2',
          username: 'Marketing User 2',
          email: 'marketing2@test.com',
          role: 'Marketing Manager',
        } as User,
      ];

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockUserRepository.find.mockResolvedValue(mockMarketingManagers);

      // Act
      await service.notifyOnPromotionCreated(mockPromotion, mockContentManager);

      // Assert
      expect(mockCourseRepository.findOne).toHaveBeenCalledWith({
        where: { courseId: mockPromotion.course.courseId },
        relations: ['instructor'],
      });

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: { role: 'Marketing Manager' },
        select: ['user_id', 'username', 'email', 'role'],
      });

      // Should create 3 notifications: general, instructor-specific, marketing-specific
      expect(mockNotificationService.createNotification).toHaveBeenCalledTimes(3);

      // Check general notification
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Promotion Created',
          type: NotificationType.PROMOTION_CREATED,
          priority: NotificationPriority.HIGH,
          courseId: mockCourse.courseId,
          createdBy: mockContentManager.user_id,
          recipientIds: expect.arrayContaining([
            mockInstructor.user_id,
            'marketing-1',
            'marketing-2',
          ]),
        })
      );

      // Check instructor-specific notification
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Promotion Created for Your Course',
          recipientIds: [mockInstructor.user_id],
          metadata: expect.objectContaining({
            personalizedMessage: true,
          }),
        })
      );

      // Check marketing-specific notification
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Promotion Available for Marketing',
          recipientIds: ['marketing-1', 'marketing-2'],
          metadata: expect.objectContaining({
            marketingFocus: true,
            suggestedActions: expect.arrayContaining([
              'Create marketing campaigns',
              'Update promotional materials',
              'Notify sales team',
              'Schedule social media posts',
            ]),
          }),
        })
      );
    });

    it('should handle case when no marketing managers exist', async () => {
      // Arrange
      const mockInstructor: User = {
        user_id: 'instructor-1',
        username: 'John Instructor',
        email: 'instructor@test.com',
        role: 'instructor',
      } as User;

      const mockCourse: Course = {
        courseId: 'course-1',
        title: 'Test Course',
        instructor: mockInstructor,
      } as Course;

      const mockPromotion: Promotion = {
        id: 'promotion-1',
        name: 'Summer Sale',
        code: 'SUMMER2024',
        discount: 20,
        course: mockCourse,
      } as Promotion;

      const mockContentManager: User = {
        user_id: 'content-manager-1',
        username: 'Jane Manager',
        role: 'Content Manager',
      } as User;

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockUserRepository.find.mockResolvedValue([]); // No marketing managers

      // Act
      await service.notifyOnPromotionCreated(mockPromotion, mockContentManager);

      // Assert
      // Should still create 2 notifications: general and instructor-specific
      expect(mockNotificationService.createNotification).toHaveBeenCalledTimes(2);
    });

    it('should handle case when course or instructor not found', async () => {
      // Arrange
      const mockPromotion: Promotion = {
        id: 'promotion-1',
        name: 'Summer Sale',
        course: { courseId: 'non-existent-course' } as Course,
      } as Promotion;

      const mockContentManager: User = {
        user_id: 'content-manager-1',
        username: 'Jane Manager',
        role: 'Content Manager',
      } as User;

      mockCourseRepository.findOne.mockResolvedValue(null);

      // Act
      await service.notifyOnPromotionCreated(mockPromotion, mockContentManager);

      // Assert
      expect(mockNotificationService.createNotification).not.toHaveBeenCalled();
    });
  });

  describe('notifyOnPromotionExpiring', () => {
    it('should send urgent notification for promotion expiring in 1 day', async () => {
      // Arrange
      const mockInstructor: User = {
        user_id: 'instructor-1',
        username: 'John Instructor',
        role: 'instructor',
      } as User;

      const mockCourse: Course = {
        courseId: 'course-1',
        title: 'Test Course',
        instructor: mockInstructor,
      } as Course;

      const mockPromotion: Promotion = {
        id: 'promotion-1',
        name: 'Summer Sale',
        code: 'SUMMER2024',
        discount: 20,
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        course: mockCourse,
      } as Promotion;

      const mockMarketingManagers: User[] = [
        {
          user_id: 'marketing-1',
          username: 'Marketing User 1',
          role: 'Marketing Manager',
        } as User,
      ];

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockUserRepository.find.mockResolvedValue(mockMarketingManagers);

      // Act
      await service.notifyOnPromotionExpiring(mockPromotion, 1);

      // Assert
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Promotion Expiring Soon',
          type: NotificationType.PROMOTION_EXPIRED,
          priority: NotificationPriority.URGENT, // Should be URGENT for 1 day
          message: expect.stringContaining('will expire in 1 day(s)'),
          metadata: expect.objectContaining({
            daysUntilExpiry: 1,
            suggestedActions: expect.arrayContaining([
              'Extend promotion period',
              'Create new promotion',
              'Final marketing push',
              'Notify customers about expiry',
            ]),
          }),
        })
      );
    });

    it('should send high priority notification for promotion expiring in 3 days', async () => {
      // Arrange
      const mockInstructor: User = {
        user_id: 'instructor-1',
        username: 'John Instructor',
        role: 'instructor',
      } as User;

      const mockCourse: Course = {
        courseId: 'course-1',
        title: 'Test Course',
        instructor: mockInstructor,
      } as Course;

      const mockPromotion: Promotion = {
        id: 'promotion-1',
        name: 'Summer Sale',
        course: mockCourse,
      } as Promotion;

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockUserRepository.find.mockResolvedValue([]);

      // Act
      await service.notifyOnPromotionExpiring(mockPromotion, 3);

      // Assert
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: NotificationPriority.HIGH, // Should be HIGH for 3 days
        })
      );
    });
  });
});

/**
 * Integration Test Example
 * 
 * Để test toàn bộ workflow, bạn có thể tạo integration test:
 */
describe('Promotion Notification Integration', () => {
  // Test case: Content Manager creates promotion -> Notifications sent
  it('should complete full workflow when Content Manager creates promotion', async () => {
    // 1. Setup test data (users, courses)
    // 2. Create promotion via API
    // 3. Verify notifications were created
    // 4. Verify WebSocket events were sent
    // 5. Verify notification metadata is correct
  });

  // Test case: Promotion expiry workflow
  it('should send expiry notifications via cron job', async () => {
    // 1. Setup promotions with different expiry dates
    // 2. Run cron job manually
    // 3. Verify correct notifications were sent
    // 4. Verify priority levels are correct
  });
});