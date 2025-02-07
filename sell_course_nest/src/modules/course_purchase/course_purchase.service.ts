/*
https://docs.nestjs.com/providers#services
*/

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Course } from '../course/entities/course.entity';
import { User } from '../user/entities/user.entity';
import { CoursePurchase } from './entities/course_purchase.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class Course_purchaseService {
  constructor(
    @InjectRepository(Course)
    private readonly CourseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CoursePurchase)
    private coursePurchasedRepository: Repository<CoursePurchase>,
  ) {}

  async createCoursePurchased(user_id: string, courseId: string) {
    const user = await this.userRepository.findOne({ where: { user_id } });
    const course = await this.CourseRepository.findOne({ where: { courseId } });
    if (!user_id || !courseId) {
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }
    const coursePurchase = this.coursePurchasedRepository.create({
      user,
      course,
    });

    return await this.coursePurchasedRepository.save(coursePurchase);
  }
}
