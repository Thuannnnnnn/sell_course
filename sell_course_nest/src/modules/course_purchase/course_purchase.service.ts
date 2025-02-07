import { CoursePurchasedDTO } from './dto/courseResponseData.dto';

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

  async getAllCoursePurchase(user_id: string): Promise<CoursePurchasedDTO[]> {
    try {
      const user = await this.userRepository.findOne({ where: { user_id } });
      if (!user) {
        throw new HttpException('User not found', 404);
      }
      const coursePurchases = await this.coursePurchasedRepository.find({
        where: { user: { user_id } },
        relations: { course: { category: true }, user: true },
      });
      return coursePurchases.map(
        (purchase) =>
          new CoursePurchasedDTO(
            user_id,
            purchase.user.email,
            purchase.coursePurchaseId,
            purchase.course.courseId,
            purchase.course.title,
            purchase.course.category?.name || 'Unknown Category',
            purchase.course.category?.categoryId || 'Unknown',
            purchase.course.imageInfo || '', // Handle null imageInfo
          ),
      );
    } catch {
      throw new HttpException('Error retrieving course purchases', 500);
    }
  }
}
