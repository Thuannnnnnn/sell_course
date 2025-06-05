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
      relations: ['instructor', 'category'],
    });

    if (courses.length === 0) {
      throw new HttpException('No courses found.', HttpStatus.NOT_FOUND);
    }
    const courseResponseDTOs = courses.map((course) => {
      return new CourseResponseDTO(
        course.courseId,
        course.title,
        course.shortDescription,
        course.description,
        course.duration,
        course.price,
        course.videoIntro,
        course.thumbnail,
        course.rating,
        course.skill,
        course.level,
        course.status, // Added isPublic
        course.createdAt,
        course.updatedAt,
        course.instructor.user_id,
        course.instructor.username,
        course.instructor.avatarImg,
        course.category.categoryId,
        course.category.name,
      );
    });

    return courseResponseDTOs;
  }

  async getCourseById(courseId: string): Promise<CourseResponseDTO> {
    const course = await this.CourseRepository.findOne({
      relations: ['instructor', 'category'],
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
      course.shortDescription,
      course.description,
      course.duration,
      course.price,
      course.videoIntro,
      course.thumbnail,
      course.rating,
      course.skill,
      course.level,
      course.status,
      course.createdAt,
      course.updatedAt,
      course.instructor.user_id,
      course.instructor.username,
      course.instructor.avatarImg,
      course.category.categoryId,
      course.category.name,
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
    const { instructorId, categoryId, title } = course;

    // Kiểm tra user
    const userData = await this.userRepository.findOne({
      where: { user_id: instructorId },
    });
    if (!userData) {
      throw new HttpException(
        `User with ID ${instructorId} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Kiểm tra category
    const categoryData = await this.categoryRepository.findOne({
      where: { categoryId },
    });
    if (!categoryData) {
      throw new HttpException(
        `Category with ID ${categoryId} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Kiểm tra khóa học trùng lặp
    const courseData = await this.CourseRepository.findOne({
      where: { title },
    });
    if (courseData) {
      throw new HttpException(
        `Course with title '${title}' already exists.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Xử lý file upload (nếu có)
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
      short_description: course.short_description,
      duration: course.duration,
      rating: course.rating,
      skill: course.skill,
      level: course.level,
      status: course.status ?? false, // Mặc định là true nếu không có giá trị
    });

    return {
      ...newCourse,
      instructorId: userData.user_id,
      instructorName: userData.email,
      instructorAvatar: userData.avatarImg,
      categoryId: categoryData.categoryId,
      categoryName: categoryData.name,
      status: newCourse.status,
      courseId: newCourse.courseId,
      title: newCourse.title,
      price: newCourse.price,
      description: newCourse.description,
      videoIntro: newCourse.videoInfo,
      thumbnail: newCourse.imageInfo,
      short_description: newCourse.short_description,
      duration: newCourse.duration,
      rating: newCourse.rating,
      skill: newCourse.skill,
      level: newCourse.level,
      createdAt: newCourse.createdAt,
      updatedAt: newCourse.updatedAt,
    };
  }

  async updateCourse(
    courseId: string,
    updateData: Partial<CourseRequestDTO>,
    files?: {
      videoInfo?: Express.Multer.File[];
      imageInfo?: Express.Multer.File[];
    },
  ): Promise<CourseResponseDTO> {
    // Lấy thông tin khóa học hiện tại
    const course = await this.CourseRepository.findOne({
      where: { courseId },
      relations: ['instructor', 'category'],
    });
    if (!course) {
      throw new HttpException(
        `Course with ID ${courseId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Cập nhật user nếu có
    if (updateData.instructorId) {
      const userData = await this.userRepository.findOne({
        where: { user_id: updateData.instructorId },
      });
      if (!userData) {
        throw new HttpException(
          `User with ID ${updateData.instructorId} not found.`,
          HttpStatus.NOT_FOUND,
        );
      }
      course.instructor = userData;
    }

    // Cập nhật category nếu có
    if (updateData.categoryId) {
      const categoryData = await this.categoryRepository.findOne({
        where: { categoryId: updateData.categoryId },
      });
      if (!categoryData) {
        throw new HttpException(
          `Category with ID ${updateData.categoryId} not found.`,
          HttpStatus.NOT_FOUND,
        );
      }
      course.category = categoryData;
    }

    // Xử lý tải file nếu có
    if (files?.videoInfo?.[0])
      course.videoIntro = await azureUpload(files.videoInfo[0]);
    if (files?.imageInfo?.[0])
      course.thumbnail = await azureUpload(files.imageInfo[0]);

    // Cập nhật các trường khác từ updateData
    Object.assign(course, updateData);

    // Cập nhật thời gian và lưu khóa học
    course.updatedAt = new Date();
    const updatedCourse = await this.CourseRepository.save(course);

    // Trả về response
    return new CourseResponseDTO(
      updatedCourse.courseId,
      updatedCourse.title,
      updatedCourse.shortDescription,
      updatedCourse.description,
      updatedCourse.duration,
      updatedCourse.price,
      updatedCourse.videoIntro,
      updatedCourse.thumbnail,
      updatedCourse.rating,
      updatedCourse.skill,
      updatedCourse.level,
      updatedCourse.status,
      updatedCourse.createdAt,
      updatedCourse.updatedAt,
      updatedCourse.instructor.user_id,
      updatedCourse.instructor.username,
      updatedCourse.instructor.avatarImg,
      updatedCourse.category.categoryId,
      updatedCourse.category.name,
    );
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
