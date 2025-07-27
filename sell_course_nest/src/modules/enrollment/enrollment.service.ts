/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly notificationService: NotificationService,
  ) {}

  async createEnrollment(
    enrollmentId: number,
    userId: string,
    courseId: string,
    status: string,
  ): Promise<Enrollment> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const course = await this.courseRepository.findOne({ where: { courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const enrollment = this.enrollmentRepository.create({
      enrollmentId,
      user,
      course,
      status,
    });
    
    const savedEnrollment = await this.enrollmentRepository.save(enrollment);
    
    // Send enrollment notification
    try {
      await this.notificationService.notifyUserEnrolled(
        course.courseId,
        userId,
        user.username || 'Student'
      );
    } catch (error) {
      console.error('Failed to send enrollment notification:', error);
    }
    
    return savedEnrollment;
  }

  async checkEnrollment(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        user: { user_id: userId },
        course: { courseId: courseId },
      },
      relations: ['user', 'course'],
    });
    return !!enrollment;
  }

  async getEnrollmentById(enrollmentId: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { enrollmentId },
      relations: ['user', 'course'],
    });
    return enrollment;
  }

  async getAllEnrollments(): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({ relations: ['user', 'course'] });
  }

  async updateEnrollmentStatus(
    enrollmentId: number,
    status: string,
  ): Promise<Enrollment> {
    const enrollment = await this.getEnrollmentById(enrollmentId);
    if (!enrollment && !status) {
      return;
    }
    enrollment.status = status;
    return this.enrollmentRepository.save(enrollment);
  }

  async deleteEnrollment(enrollmentId: number): Promise<void> {
    const enrollment = await this.getEnrollmentById(enrollmentId);
    await this.enrollmentRepository.remove(enrollment);
  }
}
