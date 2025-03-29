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
import axios from 'axios';

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

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post(
        `${process.env.FASTAPI_URL}/create_course_embedding`,
        {
          text: text,
        },
      );
      return response.data.embedding;
    } catch (error) {
      throw new HttpException(
        `Không thể tạo embedding: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
        course.user.username,
        course.user.avatarImg,
        course.category.name,
        course.category.categoryId,
        course.isPublic, // Added isPublic
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
      course.user.username,
      course.user.avatarImg,
      course.category.name,
      course.category.categoryId,
      course.isPublic, // Added isPublic
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
    const { userId, categoryId, title, isPublic } = course;

    // Kiểm tra user
    const userData = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!userData) {
      throw new HttpException(
        `User with ID ${userId} not found.`,
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

    // const combinedText = `${title} ${course.description} ${categoryData.name}`;
    // const embedding = await this.generateEmbedding(combinedText);

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
      isPublic: isPublic ?? true,
      embedding: [1, 3, 2],
    });

    return {
      ...newCourse,
      userId: userData.user_id,
      userName: userData.email,
      userAvata: userData.avatarImg,
      categoryId: categoryData.categoryId,
      categoryName: categoryData.name,
      isPublic: newCourse.isPublic,
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
    // Lấy thông tin khóa học hiện tại
    const course = await this.CourseRepository.findOne({
      where: { courseId },
      relations: ['user', 'category'],
    });
    if (!course) {
      throw new HttpException(
        `Course with ID ${courseId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Lưu trữ giá trị ban đầu của các trường liên quan đến embedding
    const originalTitle = course.title;
    const originalDescription = course.description;
    const originalCategoryId = course.category.categoryId;

    // Cập nhật user nếu có
    if (updateData.userId) {
      const userData = await this.userRepository.findOne({
        where: { user_id: updateData.userId },
      });
      if (!userData) {
        throw new HttpException(
          `User with ID ${updateData.userId} not found.`,
          HttpStatus.NOT_FOUND,
        );
      }
      course.user = userData;
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
      course.videoInfo = await azureUpload(files.videoInfo[0]);
    if (files?.imageInfo?.[0])
      course.imageInfo = await azureUpload(files.imageInfo[0]);

    // Cập nhật các trường khác từ updateData
    Object.assign(course, updateData);

    // Kiểm tra xem embedding có cần tạo lại không
    const needsEmbeddingUpdate =
      course.title !== originalTitle ||
      course.description !== originalDescription ||
      course.category.categoryId !== originalCategoryId;

    if (needsEmbeddingUpdate) {
      const combinedText = `${course.title} ${course.description} ${course.category.name}`;
      course.embedding = await this.generateEmbedding(combinedText);
    }

    // Cập nhật thời gian và lưu khóa học
    course.updatedAt = new Date();
    const updatedCourse = await this.CourseRepository.save(course);

    // Trả về response
    return new CourseResponseDTO(
      updatedCourse.courseId,
      updatedCourse.title,
      updatedCourse.price,
      updatedCourse.description,
      updatedCourse.videoInfo,
      updatedCourse.imageInfo,
      updatedCourse.createdAt,
      updatedCourse.updatedAt,
      updatedCourse.user.user_id,
      updatedCourse.user.username,
      updatedCourse.user.avatarImg,
      updatedCourse.category.name,
      updatedCourse.category.categoryId,
      updatedCourse.isPublic,
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
