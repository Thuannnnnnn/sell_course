import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CourseDTO } from './dto/courseData.dto';
import { User } from '../user/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { v4 as uuidv4 } from 'uuid';
import { CustomError } from '../CustomError';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly CourseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getAllCourses(): Promise<CourseDTO[]> {
    const courses = await this.CourseRepository.find({
      relations: ['user', 'category'],
    });
    return courses.map((course) => {
      return new CourseDTO(
        course.courseId,
        course.title,
        course.price,
        course.description,
        course.videoInfo,
        course.imageInfo,
        course.createdAt,
        course.updatedAt,
        course.user.user_id,
        course.category.categoryId,
      );
    });
  }

  async getCourseById(courseId: string): Promise<CourseDTO> {
    const course = await this.CourseRepository.findOne({
      relations: ['user', 'category'],
      where: { courseId },
    });

    if (!course) {
      throw new CustomError(404, `Course with ID ${courseId} not found`);
    }

    return new CourseDTO(
      course.courseId,
      course.title,
      course.price,
      course.description,
      course.videoInfo,
      course.imageInfo,
      course.createdAt,
      course.updatedAt,
      course.user.user_id,
      course.category.categoryId,
    );
  }

  async createCourse(course: CourseDTO): Promise<CourseDTO> {
    const { userId, categoryId, title } = course;

    const userData = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!userData) {
      throw new CustomError(404, `Không tìm thấy user với ID ${userId}.`);
    }
    const categoryData = await this.categoryRepository.findOne({
      where: { categoryId },
    });
    if (!categoryData) {
      throw new CustomError(
        404,
        `Không tìm thấy category với ID ${categoryId}.`,
      );
    }

    const courseData = await this.CourseRepository.findOne({
      where: { title },
    });
    if (courseData) {
      throw new CustomError(404, `Course với title '${title}' đã tồn tại.`);
    }

    const newCourse = await this.CourseRepository.save({
      courseId: uuidv4(),
      title: course.title,
      description: course.description,
      category: categoryData,
      imageInfo: course.imageInfo,
      price: course.price,
      videoInfo: course.videoInfo,
      user: userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return new CourseDTO(
      newCourse.courseId,
      newCourse.title,
      newCourse.price,
      newCourse.description,
      newCourse.videoInfo,
      newCourse.imageInfo,
      newCourse.createdAt,
      newCourse.updatedAt,
      newCourse.user.user_id,
      newCourse.category.categoryId,
    );
  }

  async updateCourse(
    courseId: string,
    updateData: Partial<Course>,
  ): Promise<CourseDTO> {
    const course = await this.CourseRepository.findOne({
      where: { courseId },
      relations: ['user', 'category'],
    });

    if (!course) {
      throw new CustomError(404, `Course with ID ${courseId} not found`);
    }

    Object.assign(course, updateData);
    const updatedCourse = await this.CourseRepository.save(course);
    return new CourseDTO(
      updatedCourse.courseId,
      updatedCourse.title,
      updatedCourse.price,
      updatedCourse.description,
      updatedCourse.videoInfo,
      updatedCourse.imageInfo,
      updatedCourse.createdAt,
      new Date(),
      updatedCourse.user.user_id,
      updatedCourse.category.categoryId,
    );
  }

  async deleteCourse(courseId: string): Promise<void> {
    const course = await this.CourseRepository.findOne({
      where: { courseId },
    });

    if (!course) {
      throw new CustomError(404, `Course with ID ${courseId} not found`);
    }

    await this.CourseRepository.remove(course);
  }
}
