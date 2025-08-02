import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LearningPlan } from './learning-plan.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { PlanConstraint } from '../plan-constraint/plan-constraint.entity';
import { PlanPreference } from '../plan-preference/plan-preference.entity';
import {
  CreateLearningPlanDto,
  UpdateLearningPlanDto,
  N8nLearningPathDto,
} from './create-learning-plan.dto';

@Injectable()
export class LearningPlanService {
  constructor(
    @InjectRepository(LearningPlan)
    private planRepo: Repository<LearningPlan>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,

    @InjectRepository(PlanConstraint)
    private constraintRepo: Repository<PlanConstraint>,

    @InjectRepository(PlanPreference)
    private preferenceRepo: Repository<PlanPreference>,
  ) {}

  async create(createDto: CreateLearningPlanDto): Promise<LearningPlan> {
    const user = await this.userRepo.findOne({
      where: { user_id: createDto.userId },
    });
    if (!user) {
      throw new Error('User not found');
    }

    // Optional: Find course if courseId is provided for backward compatibility
    let course = null;
    if (createDto.courseId) {
      course = await this.courseRepo.findOne({
        where: { courseId: createDto.courseId },
      });
    }

    const newPlan = this.planRepo.create({
      user: user,
      course: course,
      targetLearningPath: createDto.targetLearningPath,
      learningPathCourses: createDto.learningPathCourses,
    });

    const savedPlan = await this.planRepo.save(newPlan);

    // Handle constraints if provided
    if (createDto.constraints && createDto.constraints.length > 0) {
      const constraints = createDto.constraints.map((c) =>
        this.constraintRepo.create({ plan: savedPlan, ...c }),
      );
      await this.constraintRepo.save(constraints);
    }

    // Handle preferences if provided
    if (createDto.preferences && createDto.preferences.length > 0) {
      const preferences = createDto.preferences.map((p) =>
        this.preferenceRepo.create({ plan: savedPlan, ...p }),
      );
      await this.preferenceRepo.save(preferences);
    }

    return this.findOne(savedPlan.planId);
  }

  // New method to handle n8n processed data
  async createFromN8nData(n8nData: N8nLearningPathDto): Promise<LearningPlan> {
    const user = await this.userRepo.findOne({
      where: { user_id: n8nData.userId },
    });
    if (!user) {
      throw new Error('User not found');
    }

    const newPlan = this.planRepo.create({
      user: user,
      targetLearningPath: n8nData.targetLearningPath,
      learningPathCourses: n8nData.learningPathCourses,
    });

    return await this.planRepo.save(newPlan);
  }

  async findOne(planId: string) {
    return this.planRepo.findOne({
      where: { planId },
      relations: ['user', 'course', 'constraints', 'preferences'],
    });
  }

  async findAll() {
    return this.planRepo.find({
      relations: ['user', 'course', 'constraints', 'preferences'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string) {
    return this.planRepo.find({
      where: { user: { user_id: userId } },
      relations: ['user', 'course', 'constraints', 'preferences'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(planId: string, updateDto: UpdateLearningPlanDto) {
    const plan = await this.planRepo.findOneByOrFail({ planId });

    // Update primitive fields
    Object.assign(plan, {
      targetLearningPath:
        updateDto.targetLearningPath ?? plan.targetLearningPath,
      learningPathCourses:
        updateDto.learningPathCourses ?? plan.learningPathCourses,
      updatedAt: new Date(),
    });

    await this.planRepo.save(plan);

    // Update constraints if provided
    if (updateDto.constraints) {
      await this.constraintRepo.delete({ plan: { planId } });
      if (updateDto.constraints.length > 0) {
        const newConstraints = updateDto.constraints.map((c) =>
          this.constraintRepo.create({ plan, ...c }),
        );
        await this.constraintRepo.save(newConstraints);
      }
    }

    // Update preferences if provided
    if (updateDto.preferences) {
      await this.preferenceRepo.delete({ plan: { planId } });
      if (updateDto.preferences.length > 0) {
        const newPreferences = updateDto.preferences.map((p) =>
          this.preferenceRepo.create({ plan, ...p }),
        );
        await this.preferenceRepo.save(newPreferences);
      }
    }

    return this.findOne(planId);
  }

  async remove(planId: string) {
    return this.planRepo.delete({ planId });
  }

  /**
   * Transform learning plan to frontend format
   */
  transformToFrontendFormat(plan: LearningPlan) {
    return {
      planId: plan.planId,
      userId: plan.user?.user_id,
      courseId: plan.course?.courseId,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      targetLearningPath: plan.targetLearningPath,
      learningPathCourses: plan.learningPathCourses,
      constraints: plan.constraints || [],
      preferences: plan.preferences || [],
    };
  }

  /**
   * Get all content IDs from a learning plan for progress tracking
   */
  getAllContentIds(plan: LearningPlan): string[] {
    if (!plan.learningPathCourses) return [];

    const contentIds: string[] = [];
    plan.learningPathCourses.forEach((course) => {
      course.lessons.forEach((lesson) => {
        lesson.contents.forEach((content) => {
          contentIds.push(content.contentId);
        });
      });
    });

    return contentIds;
  }
}
