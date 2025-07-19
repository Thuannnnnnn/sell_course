import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CourseRequestDTO } from './dto/courseRequestData.dto';
import { CourseResponseDTO } from './dto/courseResponseData.dto';
import { CourseDetailResponse } from './dto/courseDetailResponse.dto';
import {
  UpdateCourseStatusDto,
  ReviewCourseStatusDto,
} from './dto/update-course-status.dto';
import { CourseStatus } from './enums/course-status.enum';
import { CourseService } from './course.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
@Controller('api')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('courses/getAll')
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all courses.',
    type: [CourseResponseDTO],
  })
  @ApiResponse({
    status: 404,
    description: 'No courses found.',
  })
  async getAllCourses(): Promise<CourseResponseDTO[]> {
    return await this.courseService.getAllCourses();
  }

  @Get('instructor/courses/view_course')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all courses.',
    type: [CourseResponseDTO],
  })
  @ApiResponse({
    status: 404,
    description: 'No courses found.',
  })
  async getAllCoursesAdmin(): Promise<CourseResponseDTO[]> {
    return await this.courseService.getAllCourses();
  }

  @ApiBearerAuth('Authorization')
  @Get('instructor/courses/view_course/:id')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the course.',
    type: CourseResponseDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found with the given ID.',
  })
  async getCourseByIdAmin(
    @Param('id') courseId: string,
  ): Promise<CourseResponseDTO> {
    return await this.courseService.getCourseById(courseId);
  }

  @Get('courses/getByCourse/:id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the course.',
    type: CourseResponseDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found with the given ID.',
  })
  async getCourseById(
    @Param('id') courseId: string,
  ): Promise<CourseResponseDTO> {
    return await this.courseService.getCourseById(courseId);
  }

  @ApiBearerAuth('Authorization')
  @Post('instructor/courses/create_course')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'videoIntro', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({
    status: 201,
    description: 'The course has been successfully created.',
    type: CourseResponseDTO,
  })
  @ApiResponse({ status: 400, description: 'Invalid course data provided.' })
  async createCourse(
    @Body() course: CourseRequestDTO,
    @UploadedFiles()
    files?: {
      videoIntro?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ): Promise<CourseResponseDTO> {
    return await this.courseService.createCourse(course, files ?? {});
  }

  @ApiBearerAuth('Authorization')
  @Put('/instructor/courses/update_course/:id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'videoIntro', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an existing course' })
  @ApiResponse({
    status: 200,
    description: 'The course has been successfully updated.',
    type: CourseResponseDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found with the given ID.',
  })
  @ApiResponse({ status: 400, description: 'Invalid course data provided.' })
  async updateCourse(
    @Param('id') courseId: string,
    @Body() updateData: CourseRequestDTO,
    @UploadedFiles()
    files?: {
      videoIntro?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ): Promise<CourseResponseDTO> {
    return await this.courseService.updateCourse(
      courseId,
      updateData,
      files ?? {},
    );
  }

  @ApiBearerAuth('Authorization')
  @Delete('instructor/courses/delete_course/:id')
  @ApiOperation({ summary: 'Delete a course by ID' })
  @ApiResponse({
    status: 200,
    description: 'The course has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found with the given ID.',
  })
  async deleteCourse(@Param('id') courseId: string): Promise<void> {
    await this.courseService.deleteCourse(courseId);
  }

  @Get('courses/details/:id')
  @ApiOperation({ summary: 'Get course details with lessons and contents' })
  @ApiResponse({
    status: 200,
    description:
      'Successfully retrieved course details with lessons and contents.',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found with the given ID.',
  })
  async getCourseDetails(
    @Param('id') courseId: string,
  ): Promise<CourseDetailResponse> {
    return this.courseService.getCourseWithLessonsAndContents(courseId);
  }

  @Get('getByCategory/:category_id')
  async getByCategory(@Param('category_id') category_id: string) {
    return this.courseService.getCoursesByCategory(category_id);
  }

  @Patch('courses/:courseId/status')
  @ApiBearerAuth('Authorization')
  @ApiOperation({
    summary: 'Update course status (instructor only - DRAFT/PENDING_REVIEW)',
  })
  @ApiResponse({
    status: 200,
    description: 'Course status updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition.',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only update status of your own courses.',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found.',
  })
  async updateCourseStatus(
    @Param('courseId') courseId: string,
    @Body() updateStatusDto: UpdateCourseStatusDto,
    // TODO: Get instructorId from JWT token in authentication guard
    // For now, you'll need to add authentication and extract from token
  ): Promise<{ message: string }> {
    // This should be extracted from JWT token in real implementation
    const instructorId = 'temp-instructor-id'; // Replace with actual JWT extraction
    return this.courseService.updateCourseStatus(
      courseId,
      updateStatusDto,
      instructorId,
    );
  }

  @Patch('admin/courses/:courseId/review')
  @ApiBearerAuth('Authorization')
  @ApiOperation({
    summary: 'Review course status (admin only - PUBLISHED/REJECTED)',
  })
  @ApiResponse({
    status: 200,
    description: 'Course reviewed successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Only courses in PENDING_REVIEW status can be reviewed.',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found.',
  })
  async reviewCourseStatus(
    @Param('courseId') courseId: string,
    @Body() reviewStatusDto: ReviewCourseStatusDto,
  ): Promise<{ message: string }> {
    return this.courseService.reviewCourseStatus(courseId, reviewStatusDto);
  }

  @Get('admin/courses/status/:status')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Get courses by status (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved courses by status.',
    type: [CourseResponseDTO],
  })
  async getCoursesByStatus(
    @Param('status') status: CourseStatus,
  ): Promise<CourseResponseDTO[]> {
    return this.courseService.getCoursesByStatus(status);
  }
}
