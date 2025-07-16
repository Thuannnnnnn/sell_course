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

    const constraints = createDto.constraints.map((c) =>
      this.constraintRepo.create({ plan: savedPlan, ...c }),
    );
    await this.constraintRepo.save(constraints);

    const preferences = createDto.preferences.map((p) =>
      this.preferenceRepo.create({ plan: savedPlan, ...p }),
    );
    await this.preferenceRepo.save(preferences);

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

    // Cập nhật constraint nếu được gửi
    if (updateDto.constraints) {
      await this.constraintRepo.delete({ plan: { planId } });
      const newConstraints = updateDto.constraints.map((c) =>
        this.constraintRepo.create({ plan, ...c }),
      );
      await this.constraintRepo.save(newConstraints);
    }

    // Cập nhật preference nếu được gửi
    if (updateDto.preferences) {
      await this.preferenceRepo.delete({ plan: { planId } });
      const newPreferences = updateDto.preferences.map((p) =>
        this.preferenceRepo.create({ plan, ...p }),
      );
      await this.preferenceRepo.save(newPreferences);
    }

    return this.findOne(planId);
  }

  async remove(planId: string) {
    return this.planRepo.delete({ planId });
  }
}
