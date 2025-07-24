import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CourseRequestDTO } from './dto/courseRequestData.dto';
import { CourseResponseDTO } from './dto/courseResponseData.dto';
import { CourseDetailResponse } from './dto/courseDetailResponse.dto';
import {
  UpdateCourseStatusDto,
  ReviewCourseStatusDto,
} from './dto/update-course-status.dto';
import { CourseStatus } from './enums/course-status.enum';
import { User } from '../user/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Contents } from '../contents/entities/contents.entity';
import { Video } from '../video/entities/video.entity';
import { Docs } from '../docs/entities/docs.entity';
import { Quizz } from '../quizz/entities/quizz.entity';
import { Exam } from '../exam/entities/exam.entity';
import { v4 as uuidv4 } from 'uuid';
import { HttpException, HttpStatus } from '@nestjs/common';
import { azureUpload } from 'src/utilities/azure.service';
import { CourseNotificationService } from '../notification/course-notification.service';
import { Notification } from '../notification/entities/notification.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly CourseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Contents)
    private contentsRepository: Repository<Contents>,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(Docs)
    private docsRepository: Repository<Docs>,
    @InjectRepository(Quizz)
    private quizzRepository: Repository<Quizz>,
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private courseNotificationService: CourseNotificationService,
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
      status: course.status ?? CourseStatus.DRAFT,
    });

    // Gửi thông báo tự động khi khóa học được tạo và có status PENDING_REVIEW
    console.log(`📋 Course created with status: ${newCourse.status}`);
    if (newCourse.status === CourseStatus.PENDING_REVIEW) {
      console.log(`🚀 Triggering notifications for course: ${newCourse.title}`);
      try {
        await this.courseNotificationService.notifyOnCourseCreated(newCourse);
        console.log(`✅ Notifications sent successfully for course: ${newCourse.title}`);
      } catch (error) {
        console.error('❌ Failed to send course creation notifications:', error);
        // Không throw error để không ảnh hưởng đến việc tạo khóa học
      }
    } else {
      console.log(`⏸️ No notifications sent - course status is not PENDING_REVIEW`);
    }

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

    // Validate status transition if status is being updated
    if (updateData.status && updateData.status !== course.status) {
      const allowedTransitions = {
        [CourseStatus.DRAFT]: [CourseStatus.PENDING_REVIEW],
        [CourseStatus.PENDING_REVIEW]: [CourseStatus.DRAFT],
        [CourseStatus.REJECTED]: [
          CourseStatus.DRAFT,
          CourseStatus.PENDING_REVIEW,
        ],
        [CourseStatus.PUBLISHED]: [], // Published courses cannot be changed via regular update
        [CourseStatus.ARCHIVED]: [], // Archived courses cannot be changed via regular update
      };

      if (!allowedTransitions[course.status]?.includes(updateData.status)) {
        throw new HttpException(
          `Cannot change status from ${course.status} to ${updateData.status}. Use admin review process for published/archived courses.`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Cập nhật các trường khác từ updateData
    Object.assign(course, updateData);

    // Theo dõi các trường đã thay đổi để gửi thông báo
    const changedFields: string[] = [];
    const originalCourse = await this.CourseRepository.findOne({
      where: { courseId },
      relations: ['instructor', 'category'],
    });

    if (originalCourse) {
      if (updateData.title && originalCourse.title !== updateData.title) changedFields.push('title');
      if (updateData.description && originalCourse.description !== updateData.description) changedFields.push('description');
      if (updateData.price && originalCourse.price !== updateData.price) changedFields.push('price');
      if (updateData.status && originalCourse.status !== updateData.status) changedFields.push('status');
      if (files?.videoIntro?.[0]) changedFields.push('video intro');
      if (files?.thumbnail?.[0]) changedFields.push('thumbnail');
    }

    // Cập nhật thời gian và lưu khóa học
    course.updatedAt = new Date();
    const updatedCourse = await this.CourseRepository.save(course);

    // Gửi thông báo tự động khi khóa học được cập nhật
    if (changedFields.length > 0) {
      try {
        await this.courseNotificationService.notifyOnCourseUpdated(updatedCourse, changedFields);
      } catch (error) {
        console.error('Failed to send course update notifications:', error);
        // Không throw error để không ảnh hưởng đến việc cập nhật khóa học
      }
    }

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

    // Delete related notifications first
    await this.notificationRepository.delete({ course: { courseId } });

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

  async getCourseWithLessonsAndContents(
    courseId: string,
  ): Promise<CourseDetailResponse> {
    // Lấy thông tin khóa học
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

    // Lấy tất cả lessons của khóa học
    const lessons = await this.lessonRepository.find({
      where: { course: { courseId } },
      order: { order: 'ASC' },
    });

    // Lấy tất cả contents, video, doc, quiz cho từng lesson
    const lessonsWithContents = await Promise.all(
      lessons.map(async (lesson) => {
        const contents = await this.contentsRepository.find({
          where: { lesson: { lessonId: lesson.lessonId } },
          order: { order: 'ASC' },
        });

        const contentsWithDetails = await Promise.all(
          contents.map(async (content) => {
            const contentData: any = {
              contentId: content.contentId,
              contentName: content.contentName,
              contentType: content.contentType,
              order: content.order,
              createdAt: content.createdAt,
              updatedAt: content.updatedAt,
            };

            // Lấy chi tiết theo từng loại content
            if (content.contentType === 'video') {
              const video = await this.videoRepository.findOne({
                where: { contents: { contentId: content.contentId } },
              });
              if (video) {
                contentData.video = {
                  videoId: video.videoId,
                  title: video.title,
                  description: video.description,
                  url: video.url,
                  urlScript: video.urlScript,
                  createdAt: video.createdAt,
                };
              }
            }

            if (content.contentType === 'doc') {
              const doc = await this.docsRepository.findOne({
                where: { contents: { contentId: content.contentId } },
              });
              if (doc) {
                contentData.doc = {
                  docsId: doc.docsId,
                  title: doc.title,
                  url: doc.url,
                  createdAt: doc.createdAt,
                };
              }
            }

            if (content.contentType === 'quizz') {
              const quiz = await this.quizzRepository.findOne({
                where: { contentId: content.contentId },
                relations: ['questions', 'questions.answers'],
              });
              if (quiz) {
                contentData.quiz = {
                  quizzId: quiz.quizzId,
                  createdAt: quiz.createdAt,
                  questions: quiz.questions.map((question) => ({
                    questionId: question.questionId,
                    question: question.question,
                    difficulty: question.difficulty,
                    weight: question.weight,
                    answers: question.answers.map((answer) => ({
                      answerId: answer.answerId,
                      answer: answer.answer,
                      isCorrect: answer.isCorrect,
                    })),
                  })),
                };
              }
            }

            return contentData;
          }),
        );

        return {
          lessonId: lesson.lessonId,
          lessonName: lesson.lessonName,
          order: lesson.order,
          createdAt: lesson.createdAt,
          updatedAt: lesson.updatedAt,
          contents: contentsWithDetails,
        };
      }),
    );

    // Lấy thông tin exam của khóa học
    const exam = await this.examRepository.findOne({
      where: { course: { courseId } },
      relations: ['questions', 'questions.answers'],
    });

    let examData = null;
    if (exam) {
      examData = {
        examId: exam.examId,
        createdAt: exam.createdAt,
        questions: exam.questions.map((question) => ({
          questionId: question.questionId,
          question: question.question,
          difficulty: question.difficulty,
          weight: question.weight,
          answers: question.answers.map((answer) => ({
            answerId: answer.answerId,
            answer: answer.answer,
            isCorrect: answer.isCorrect,
          })),
        })),
      };
    }

    return {
      courseId: course.courseId,
      title: course.title,
      description: course.description,
      short_description: course.short_description,
      duration: course.duration,
      price: course.price,
      videoIntro: course.videoIntro,
      thumbnail: course.thumbnail,
      rating: course.rating,
      skill: course.skill,
      level: course.level,
      status: course.status,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      instructor: {
        userId: course.instructor.user_id,
        username: course.instructor.username,
        email: course.instructor.email,
        avatarImg: course.instructor.avatarImg,
      },
      category: {
        categoryId: course.category.categoryId,
        name: course.category.name,
      },
      lessons: lessonsWithContents,
      exam: examData,
      totalLessons: lessons.length,
      totalContents: lessonsWithContents.reduce(
        (total, lesson) => total + lesson.contents.length,
        0,
      ),
    };
  }

  // Update course status by course creator (only DRAFT <-> PENDING_REVIEW)
  async updateCourseStatus(
    courseId: string,
    updateStatusDto: UpdateCourseStatusDto,
    instructorId: string,
  ): Promise<{ message: string }> {
    const course = await this.CourseRepository.findOne({
      where: { courseId },
      relations: ['instructor'],
    });

    if (!course) {
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    }

    // Verify the instructor owns this course
    if (course.instructor.user_id !== instructorId) {
      throw new HttpException(
        'You can only update status of your own courses',
        HttpStatus.FORBIDDEN,
      );
    }

    // Check if current status allows this transition
    const allowedTransitions = {
      [CourseStatus.DRAFT]: [CourseStatus.PENDING_REVIEW],
      [CourseStatus.PENDING_REVIEW]: [CourseStatus.DRAFT],
      [CourseStatus.REJECTED]: [CourseStatus.PENDING_REVIEW], // Allow resubmission after rejection
    };

    if (!allowedTransitions[course.status]?.includes(updateStatusDto.status)) {
      throw new HttpException(
        `Cannot change status from ${course.status} to ${updateStatusDto.status}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const oldStatus = course.status;
    course.status = updateStatusDto.status;
    const updatedCourse = await this.CourseRepository.save(course);

    // Gửi thông báo khi status thay đổi thành PENDING_REVIEW
    if (oldStatus !== CourseStatus.PENDING_REVIEW && updateStatusDto.status === CourseStatus.PENDING_REVIEW) {
      try {
        await this.courseNotificationService.notifyOnCourseCreated(updatedCourse);
      } catch (error) {
        console.error('Failed to send course review request notifications:', error);
      }
    }

    return {
      message: `Course status updated to ${updateStatusDto.status}`,
    };
  }

  // Review course status by admin (PUBLISHED or REJECTED)
  async reviewCourseStatus(
    courseId: string,
    reviewStatusDto: ReviewCourseStatusDto,
  ): Promise<{ message: string }> {
    const course = await this.CourseRepository.findOne({
      where: { courseId },
      relations: ['instructor', 'category'], // Include instructor và category để gửi notification
    });

    if (!course) {
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    }

    // Only courses in PENDING_REVIEW can be reviewed
    if (course.status !== CourseStatus.PENDING_REVIEW) {
      throw new HttpException(
        'Only courses in PENDING_REVIEW status can be reviewed',
        HttpStatus.BAD_REQUEST,
      );
    }

    course.status = reviewStatusDto.status;
    const updatedCourse = await this.CourseRepository.save(course);

    // Gửi thông báo dựa trên kết quả review
    try {
      if (reviewStatusDto.status === CourseStatus.PUBLISHED) {
        await this.courseNotificationService.notifyOnCoursePublished(updatedCourse);
      } else if (reviewStatusDto.status === CourseStatus.REJECTED) {
        const rejectionReason = reviewStatusDto.rejectionReason || reviewStatusDto.reason || 'Không đáp ứng yêu cầu chất lượng';
        await this.courseNotificationService.notifyOnCourseRejected(updatedCourse, rejectionReason);
      }
    } catch (error) {
      console.error('Failed to send course review notifications:', error);
    }

    const action =
      reviewStatusDto.status === CourseStatus.PUBLISHED
        ? 'approved'
        : 'rejected';
    return {
      message: `Course ${action} successfully`,
    };
  }

  // Get courses by status for admin review
  async getCoursesByStatus(status: CourseStatus): Promise<CourseResponseDTO[]> {
    const courses = await this.CourseRepository.find({
      where: { status },
      relations: ['instructor', 'category'],
    });

    return courses.map((course) => this.mapCourseToResponseDTO(course));
  }

  private mapCourseToResponseDTO(course: Course): CourseResponseDTO {
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
  }
}
