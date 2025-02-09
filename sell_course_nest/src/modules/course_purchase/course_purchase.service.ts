/*
https://docs.nestjs.com/providers#services
*/

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Course } from '../course/entities/course.entity';
import { User } from '../user/entities/user.entity';
import { CoursePurchase } from './entities/course_purchase.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CoursePurchasedDTO } from './dto/courseResponseData.dto';

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

  async createCoursePurchased(email: string, courseIds: string[]) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    console.log(courseIds);
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      throw new HttpException('Invalid courseIds', HttpStatus.BAD_REQUEST);
    }

    const courses = await this.CourseRepository.find({
      where: courseIds.map((courseId) => ({ courseId })),
    });

    if (courses.length !== courseIds.length) {
      throw new HttpException('Some courses not found', HttpStatus.NOT_FOUND);
    }

    const coursePurchases = courses.map((course) =>
      this.coursePurchasedRepository.create({ user, course }),
    );

    return await this.coursePurchasedRepository.save(coursePurchases);
  }
  async getAllCoursePurchase(email: string): Promise<CoursePurchasedDTO[]> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    try {
      const coursePurchases = await this.coursePurchasedRepository.find({
        where: { user: { user_id: user.user_id } },
        relations: { course: { category: true }, user: true },
      });

      return coursePurchases.map(
        (purchase) =>
          new CoursePurchasedDTO(
            email,
            purchase.coursePurchaseId,
            purchase.course.courseId,
            purchase.course.title,
            purchase.course.category?.name || 'Unknown Category',
            purchase.course.category?.categoryId || 'Unknown',
            purchase.course.imageInfo || '',
          ),
      );
    } catch (error) {
      throw new HttpException(
        `Error retrieving course purchases: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
