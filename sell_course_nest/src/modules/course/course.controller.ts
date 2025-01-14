import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CourseRequestDTO } from './dto/courseRequestData.dto';
import { CourseResponseDTO } from './dto/courseResponseData.dto';
import { CourseService } from './course.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
@Controller('api/courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('getAll')
  async getAllCourses(): Promise<CourseResponseDTO[]> {
    return await this.courseService.getAllCourses();
  }

  @Get('getByCourse/:id')
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
  async createCourse(
    @Body() createCourseDTO: CourseRequestDTO,
  ): Promise<CourseResponseDTO> {
    return await this.courseService.createCourse(createCourseDTO);
  }

  @Put('updateCourse/:id')
  async UpdatedCourse(
    @Param('id') courseId: string,
    @Body() createCourseDTO: CourseRequestDTO,
  ): Promise<CourseResponseDTO> {
    return await this.courseService.updateCourse(courseId, createCourseDTO);
  }

  @Delete('deleteCourse/:id')
  async deleteCourse(@Param('id') courseId: string): Promise<void> {
    await this.courseService.deleteCourse(courseId);
  }
}
