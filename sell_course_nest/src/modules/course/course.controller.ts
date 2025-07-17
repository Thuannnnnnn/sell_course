import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { CourseRequestDTO } from './dto/courseRequestData.dto';
import { CourseResponseDTO } from './dto/courseResponseData.dto';
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

  @Get('admin/courses/search')
  @ApiOperation({ summary: 'Search courses for admin' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved courses.',
  })
  async searchCourses(@Req() req): Promise<any> {
    const { query = '', page = 1, limit = 10 } = req.query;
    return await this.courseService.searchCourses(query, parseInt(page), parseInt(limit));
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

  @Get('getByCategory/:category_id')
  async getByCategory(@Param('category_id') category_id: string) {
    return this.courseService.getCoursesByCategory(category_id);
  }
}
