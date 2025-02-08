import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CourseRequestDTO } from './dto/courseRequestData.dto';
import { CourseResponseDTO } from './dto/courseResponseData.dto';
import { CourseService } from './course.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
@Controller('api/')
@ApiTags('Course')
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

  @ApiBearerAuth()
  @Post('course/create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'videoInfo', maxCount: 1 },
      { name: 'imageInfo', maxCount: 1 },
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
      videoInfo?: Express.Multer.File[];
      imageInfo?: Express.Multer.File[];
    },
  ): Promise<CourseResponseDTO> {
    return await this.courseService.createCourse(course, files ?? {});
  }

  // @ApiBearerAuth()
  @Put('courses/update/:id')
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'videoInfo', maxCount: 1 },
      { name: 'imageInfo', maxCount: 1 },
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
    @Body() updateData: Partial<CourseRequestDTO>,
    @UploadedFiles()
    files?: {
      videoInfo?: Express.Multer.File[];
      imageInfo?: Express.Multer.File[];
    },
  ): Promise<CourseResponseDTO> {
    return await this.courseService.updateCourse(
      courseId,
      updateData,
      files ?? {},
    );
  }

  // @ApiBearerAuth()
  @Delete('course/deleteCourse/:id')
  // @UseGuards(JwtAuthGuard)
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
}
