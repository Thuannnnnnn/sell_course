import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CourseRequestDTO } from './dto/courseRequestData.dto';
import { CourseResponseDTO } from './dto/courseResponseData.dto';
import { User } from '../user/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { v4 as uuidv4 } from 'uuid';
import { HttpException, HttpStatus } from '@nestjs/common';
import { azureUpload } from 'src/utilities/azure.service';

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

  async getAllCourses(): Promise<CourseResponseDTO[]> {
    const courses = await this.CourseRepository.find({
      relations: ['user', 'category'],
    });

    if (courses.length === 0) {
      throw new HttpException('No courses found.', HttpStatus.NOT_FOUND);
    }
    const courseResponseDTOs = courses.map((course) => {
      return new CourseResponseDTO(
        course.courseId,
        course.title,
        course.price,
        course.description,
        course.videoInfo,
        course.imageInfo,
        course.createdAt,
        course.updatedAt,
        course.user.user_id,
        course.user.email,
        course.category.name,
        course.category.categoryId,
      );
    });

    return courseResponseDTOs;
  }

  async getCourseById(courseId: string): Promise<CourseResponseDTO> {
    const course = await this.CourseRepository.findOne({
      relations: ['user', 'category'],
      where: { courseId },
    });

    if (!course) {
      throw new HttpException(
        `Course with ID ${courseId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    const courseResponseDTO = new CourseResponseDTO(
      course.courseId,
      course.title,
      course.price,
      course.description,
      course.videoInfo,
      course.imageInfo,
      course.createdAt,
      course.updatedAt,
      course.user.user_id,
      course.category.name,
      course.user.user_id,
      course.category.categoryId,
    );
    return courseResponseDTO;
  }
  async createCourse(
    course: CourseRequestDTO,
    files?: {
      videoInfo?: Express.Multer.File[];
      imageInfo?: Express.Multer.File[];
    },
  ): Promise<CourseResponseDTO> {
    const { userId, categoryId, title } = course;

    const userData = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!userData) {
      throw new HttpException(
        `User with ID ${userId} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }

    const categoryData = await this.categoryRepository.findOne({
      where: { categoryId },
    });
    if (!categoryData) {
      throw new HttpException(
        `Category with ID ${categoryId} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }

    const courseData = await this.CourseRepository.findOne({
      where: { title },
    });

    if (courseData) {
      throw new HttpException(
        `Course with title '${title}' already exists.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    let videoUrl = '';
    let imageUrl = '';

    if (files?.videoInfo?.[0]) {
      videoUrl = await azureUpload(files.videoInfo[0]);
    }

    if (files?.imageInfo?.[0]) {
      imageUrl = await azureUpload(files.imageInfo[0]);
    }

    const newCourse = await this.CourseRepository.save({
      courseId: uuidv4(),
      title: course.title,
      description: course.description,
      category: categoryData,
      imageInfo: imageUrl,
      price: course.price,
      videoInfo: videoUrl,
      user: userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      ...newCourse,
      userId: userData.user_id,
      userName: userData.email,
      categoryId: categoryData.categoryId,
      categoryName: categoryData.name,
    } as CourseResponseDTO;
  }

  async updateCourse(
    courseId: string,
    updateData: Partial<CourseRequestDTO>,
    files?: {
      videoInfo?: Express.Multer.File[];
      imageInfo?: Express.Multer.File[];
    },
  ): Promise<CourseResponseDTO> {
    const course = await this.CourseRepository.findOne({
      where: { courseId },
      relations: ['user', 'category'],
    });
    const { userId, categoryId } = updateData;

    if (!course) {
      throw new HttpException(
        `Course with ID ${courseId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    const userData = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!userData) {
      throw new HttpException(
        `User with ID ${userId} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }

    const categoryData = await this.categoryRepository.findOne({
      where: { categoryId },
    });
    if (!categoryData) {
      throw new HttpException(
        `Category with ID ${categoryId} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }
    let videoUrl = course.videoInfo;
    let imageUrl = course.imageInfo;

    if (files?.videoInfo?.[0]) {
      videoUrl = await azureUpload(files.videoInfo[0]);
    }

    if (files?.imageInfo?.[0]) {
      imageUrl = await azureUpload(files.imageInfo[0]);
    }
    Object.assign(course, updateData, {
      category: categoryData,
      videoInfo: videoUrl,
      imageInfo: imageUrl,
      updatedAt: new Date(),
    });

    const updatedCourse = await this.CourseRepository.save(course);
    return {
      ...updatedCourse,
      userId: userData.user_id,
      userName: userData.email,
      categoryId: categoryData?.categoryId || updateData.categoryId,
      categoryName: categoryData.name,
    } as CourseResponseDTO;
  }
  async deleteCourse(courseId: string): Promise<void> {
    const course = await this.CourseRepository.findOne({
      where: { courseId },
    });

    if (!course) {
      throw new HttpException(
        `Course with ID ${courseId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.CourseRepository.remove(course);
    throw new HttpException('Removed', HttpStatus.OK);
  }
}
