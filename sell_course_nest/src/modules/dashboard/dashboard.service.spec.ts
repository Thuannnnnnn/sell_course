import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { DashboardService } from './dashboard.service';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Category } from '../category/entities/category.entity';
import { ResultExam } from '../result_exam/entities/result_exam.entity';
import { ProgressTracking } from '../progress_tracking/entities/progress.entity';
import { Forum } from '../forum/entities/forum.entity';
import { QaStudy } from '../qa_study/entities/qa.entity';

describe('DashboardService', () => {
  let service: DashboardService;
  let userRepository: Repository<User>;
  let courseRepository: Repository<Course>;
  let enrollmentRepository: Repository<Enrollment>;
  let cacheManager: Cache;

  const mockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  });

  const mockCacheManager = () => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Course),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Enrollment),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(ResultExam),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(ProgressTracking),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Forum),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(QaStudy),
          useFactory: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useFactory: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    courseRepository = module.get<Repository<Course>>(getRepositoryToken(Course));
    enrollmentRepository = module.get<Repository<Enrollment>>(getRepositoryToken(Enrollment));
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardOverview', () => {
    it('should return dashboard overview data', async () => {
      // Mock cache miss
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      
      // Mock repository responses
      jest.spyOn(userRepository, 'count').mockResolvedValue(100);
      jest.spyOn(courseRepository, 'count').mockResolvedValue(50);
      jest.spyOn(enrollmentRepository, 'count').mockResolvedValue(200);

      const result = await service.getDashboardOverview();

      expect(result).toHaveProperty('totalUsers');
      expect(result).toHaveProperty('totalCourses');
      expect(result).toHaveProperty('totalEnrollments');
      expect(result.totalUsers).toBe(100);
      expect(result.totalCourses).toBe(50);
      expect(result.totalEnrollments).toBe(200);
    });

    it('should return cached data when available', async () => {
      const cachedData = {
        totalUsers: 150,
        totalCourses: 75,
        totalEnrollments: 300,
      };

      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedData);

      const result = await service.getDashboardOverview();

      expect(result).toEqual(cachedData);
      expect(userRepository.count).not.toHaveBeenCalled();
    });
  });

  describe('clearDashboardCache', () => {
    it('should clear all dashboard cache keys', async () => {
      const delSpy = jest.spyOn(cacheManager, 'del').mockResolvedValue(undefined);

      await service.clearDashboardCache();

      expect(delSpy).toHaveBeenCalledWith('dashboard_overview');
      expect(delSpy).toHaveBeenCalledWith('revenue_analytics');
      expect(delSpy).toHaveBeenCalledWith('user_statistics');
      expect(delSpy).toHaveBeenCalledWith('course_performance');
      expect(delSpy).toHaveBeenCalledWith('enrollment_trends');
    });
  });
});