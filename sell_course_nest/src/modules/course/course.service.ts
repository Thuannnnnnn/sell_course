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
        course.short_description,
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
      course.short_description,
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
      videoIntro?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ): Promise<CourseResponseDTO> {
    const { instructorId, categoryId, title } = course;

    const userData = await this.userRepository.findOne({
      where: { user_id: instructorId },
    });
    if (!userData) {
      throw new HttpException(
        `User with ID ${instructorId} not found.`,
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
    if (files?.videoIntro?.[0]) {
      videoUrl = await azureUpload(files.videoIntro[0]);
    }
    if (files?.thumbnail?.[0]) {
      imageUrl = await azureUpload(files.thumbnail[0]);
    }

    const newCourse = await this.CourseRepository.save({
      courseId: uuidv4(),
      title: course.title,
      description: course.description,
      category: categoryData,
      thumbnail: imageUrl,
      price: course.price,
      videoIntro: videoUrl || null,
      instructor: userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      short_description: course.short_description,
      duration: course.duration,
      rating: 0,
      skill: course.skill,
      level: course.level,
      status: course.status ?? false,
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
      videoIntro: newCourse.videoIntro,
      thumbnail: newCourse.thumbnail,
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
      videoIntro?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
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
    if (files?.videoIntro?.[0])
      course.videoIntro = await azureUpload(files.videoIntro[0]);
    if (files?.thumbnail?.[0])
      course.thumbnail = await azureUpload(files.thumbnail[0]);

    // Cập nhật các trường khác từ updateData
    Object.assign(course, updateData);

    // Cập nhật thời gian và lưu khóa học
    course.updatedAt = new Date();
    const updatedCourse = await this.CourseRepository.save(course);

    // Trả về response
    return new CourseResponseDTO(
      updatedCourse.courseId,
      updatedCourse.title,
      updatedCourse.short_description,
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

  async getCoursesByCategory(categoryId: string): Promise<Course[]> {
    return this.CourseRepository.find({
      where: { category: { categoryId } },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async searchCourses(query: string, page: number = 1, limit: number = 0): Promise<{
    courses: CourseResponseDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    console.log('🔍 SearchCourses called with:', { query, page, limit });
    
    // No pagination - load all courses
    const skip = 0;
    
    try {
      const queryBuilder = this.CourseRepository.createQueryBuilder('course')
        .leftJoinAndSelect('course.instructor', 'instructor')
        .leftJoinAndSelect('course.category', 'category')
        .orderBy('course.createdAt', 'DESC'); // Order by newest first - NO LIMIT

      if (query && query.trim() !== '') {
        queryBuilder.where(
          '(LOWER(course.title) LIKE LOWER(:query) OR LOWER(course.description) LIKE LOWER(:query) OR LOWER(instructor.username) LIKE LOWER(:query))',
          { query: `%${query.trim()}%` }
        );
      }

      console.log('📡 Generated SQL:', queryBuilder.getSql());
      console.log('📡 Parameters:', queryBuilder.getParameters());

      const [courses, total] = await queryBuilder.getManyAndCount();
      
      console.log('✅ Query successful, found courses:', courses.length);
      
      const courseResponseDTOs = courses.map((course) => {
        return new CourseResponseDTO(
          course.courseId,
          course.title,
          course.short_description,
          course.description,
          course.duration,
          course.price,
          course.videoIntro,
          course.thumbnail || null, // Ensure null instead of undefined
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
      });

      return {
        courses: courseResponseDTOs,
        total,
        page: 1, // Always page 1 since no pagination
        limit: total, // Limit equals total (all items)
        totalPages: 1 // Always 1 page since no pagination
      };
    } catch (error) {
      console.error('❌ SearchCourses error:', error);
      
      // Fallback to simple query - NO LIMIT
      try {
        console.log('🔄 Trying fallback method...');
        const courses = await this.CourseRepository.find({
          relations: ['instructor', 'category'],
          order: { createdAt: 'DESC' }
        });
        
        const total = courses.length;
        
        const courseResponseDTOs = courses.map((course) => {
          return new CourseResponseDTO(
            course.courseId,
            course.title,
            course.short_description,
            course.description,
            course.duration,
            course.price,
            course.videoIntro,
            course.thumbnail || null, // Ensure null instead of undefined
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
        });

        return {
          courses: courseResponseDTOs,
          total,
          page: 1,
          limit: total,
          totalPages: 1
        };
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        throw fallbackError;
      }
    }
  }
}
