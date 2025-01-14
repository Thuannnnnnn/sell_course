import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CourseRequestDTO } from './dto/courseRequestData.dto';
import { CourseResponseDTO } from './dto/courseResponseData.dto';
import { CourseService } from './course.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
// import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
@Controller('api/courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('getAll')
  @UseGuards(JwtAuthGuard)
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

  @Get('getByCourse/:id')
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

  @Post('createCourse')
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({
    status: 201,
    description: 'The course has been successfully created.',
    type: CourseResponseDTO,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid course data provided.',
  })
  async createCourse(
    @Body() createCourseDTO: CourseRequestDTO,
  ): Promise<CourseResponseDTO> {
    return await this.courseService.createCourse(createCourseDTO);
  }

  @Put('updateCourse/:id')
  @ApiOperation({ summary: 'Update a course by ID' })
  @ApiResponse({
    status: 200,
    description: 'The course has been successfully updated.',
    type: CourseResponseDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found with the given ID.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid course data provided.',
  })
  async updateCourse(
    @Param('id') courseId: string,
    @Body() createCourseDTO: CourseRequestDTO,
  ): Promise<CourseResponseDTO> {
    return await this.courseService.updateCourse(courseId, createCourseDTO);
  }

  @Delete('deleteCourse/:id')
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
