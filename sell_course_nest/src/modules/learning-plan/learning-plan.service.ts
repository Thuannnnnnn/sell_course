import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LearningPlan } from './learning-plan.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { PlanConstraint } from '../plan-constraint/plan-constraint.entity';
import { PlanPreference } from '../plan-preference/plan-preference.entity';
import {
  N8nLearningPathDtOut,
  UpdateLearningPlanDto,
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

  async createFromN8nData(
    n8nData: N8nLearningPathDtOut,
  ): Promise<LearningPlan[]> {
    console.log(
      'n8nData',
      JSON.stringify(
        n8nData[0].learningPath[1].targetLearningPath.userId,
        null,
        2,
      ),
    );

    const user = await this.userRepo.findOne({
      where: {
        user_id: n8nData[0].learningPath[1].targetLearningPath.userId,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }
    const savedPlans: LearningPlan[] = [];
    const courses = n8nData[0].learningPath[0].learningPathCourses;
    const target = n8nData[0].learningPath[1].targetLearningPath;

    for (const course of courses) {
      const newPlan = this.planRepo.create({
        user,
        course: await this.courseRepo.findOneByOrFail({
          courseId: course.courseId,
        }),
        order: course.order,
        createdAt: new Date(),
        updatedAt: new Date(),
        targetLearningPath: target,
        learningPathCourses: [course],
      });

      savedPlans.push(await this.planRepo.save(newPlan));
    }

    return savedPlans;
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
