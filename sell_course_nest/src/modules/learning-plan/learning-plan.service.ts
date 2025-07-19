import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LearningPlan } from './learning-plan.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { PlanConstraint } from '../plan-constraint/plan-constraint.entity';
import { PlanPreference } from '../plan-preference/plan-preference.entity';
import { ScheduleItem } from '../schedule_item/entities/schedule_item.entity';
import {
  CreateLearningPlanDto,
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

    @InjectRepository(ScheduleItem)
    private scheduleItemRepo: Repository<ScheduleItem>,
  ) {}

  async create(createDto: CreateLearningPlanDto) {
    const user = await this.userRepo.findOneByOrFail({
      user_id: createDto.userId,
    });
    const course = await this.courseRepo.findOneByOrFail({
      courseId: createDto.courseId,
    });

    const plan = this.planRepo.create({
      user,
      course,
      studyGoal: createDto.studyGoal,
      totalWeeks: createDto.totalWeeks,
      narrativeTemplates: createDto.narrativeTemplates || null,
    });
    const savedPlan = await this.planRepo.save(plan);

    // Save constraints
    if (createDto.constraints && createDto.constraints.length > 0) {
      const constraints = createDto.constraints.map((c) =>
        this.constraintRepo.create({ plan: savedPlan, ...c }),
      );
      await this.constraintRepo.save(constraints);
    }

    // Save preferences
    if (createDto.preferences && createDto.preferences.length > 0) {
      const preferences = createDto.preferences.map((p) =>
        this.preferenceRepo.create({ plan: savedPlan, ...p }),
      );
      await this.preferenceRepo.save(preferences);
    }

    // Save schedule items
    if (createDto.scheduleItems && createDto.scheduleItems.length > 0) {
      const scheduleItems = createDto.scheduleItems.map((item) =>
        this.scheduleItemRepo.create({
          plan: savedPlan,
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime,
          durationMin: item.durationMin,
          course: item.courseId ? { courseId: item.courseId } : undefined,
          contentIds: item.contentIds,
          weekNumber: item.weekNumber,
          scheduledDate: item.scheduledDate,
        }),
      );
      await this.scheduleItemRepo.save(scheduleItems);
    }

    return this.findOne(savedPlan.planId);
  }

  async findOne(planId: string) {
    return this.planRepo.findOne({
      where: { planId },
      relations: [
        'user',
        'course',
        'constraints',
        'preferences',
        'scheduleItems',
      ],
    });
  }

  async findAll() {
    return this.planRepo.find({
      relations: [
        'user',
        'course',
        'constraints',
        'preferences',
        'scheduleItems',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string) {
    return this.planRepo.find({
      where: { user: { user_id: userId } },
      relations: [
        'user',
        'course',
        'constraints',
        'preferences',
        'scheduleItems',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async update(planId: string, updateDto: UpdateLearningPlanDto) {
    const plan = await this.planRepo.findOneByOrFail({ planId });

    // Update primitive fields
    Object.assign(plan, {
      studyGoal: updateDto.studyGoal ?? plan.studyGoal,
      totalWeeks: updateDto.totalWeeks ?? plan.totalWeeks,
      narrativeTemplates:
        updateDto.narrativeTemplates ?? plan.narrativeTemplates,
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

    // Update schedule items if provided
    if (updateDto.scheduleItems) {
      await this.scheduleItemRepo.delete({ plan: { planId } });
      if (updateDto.scheduleItems.length > 0) {
        const newScheduleItems = updateDto.scheduleItems.map((item) =>
          this.scheduleItemRepo.create({
            plan: plan,
            dayOfWeek: item.dayOfWeek,
            startTime: item.startTime,
            durationMin: item.durationMin,
            course: item.courseId ? { courseId: item.courseId } : undefined,
            contentIds: item.contentIds,
            weekNumber: item.weekNumber,
            scheduledDate: item.scheduledDate,
          }),
        );
        await this.scheduleItemRepo.save(newScheduleItems);
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
      studyGoal: plan.studyGoal,
      totalWeeks: plan.totalWeeks,
      createdAt: plan.createdAt,
      scheduleItems: {
        scheduleData:
          plan.scheduleItems?.map((item) => ({
            dayOfWeek: item.dayOfWeek,
            startTime: item.startTime,
            durationMin: item.durationMin,
            courseId: item.contentIds[0],
            contentIds: item.contentIds,
            weekNumber: item.weekNumber,
            scheduledDate: item.scheduledDate,
          })) || [],
        narrativeText: plan.narrativeTemplates || [],
      },
      constraints: plan.constraints || [],
      preferences: plan.preferences || [],
    };
  }
}
