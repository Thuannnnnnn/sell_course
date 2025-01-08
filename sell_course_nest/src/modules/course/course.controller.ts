import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CourseDTO } from './dto/courseData.dto';
import { CourseService } from './course.service';
import { CustomError } from '../CustomError';

@Controller('api/courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('getAll')
  async getAllCourses(): Promise<CourseDTO[]> {
    try {
      return await this.courseService.getAllCourses();
    } catch (error) {
      if (error instanceof CustomError) {
        throw new HttpException({ message: error.message }, error.statusCode);
      }

      throw new HttpException(
        { message: 'Lỗi không xác định' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('getByCourse/:id')
  async getCourseById(@Param('id') courseId: string): Promise<CourseDTO> {
    try {
      return await this.courseService.getCourseById(courseId);
    } catch (error) {
      if (error instanceof CustomError) {
        throw new HttpException({ message: error.message }, error.statusCode);
      }
      throw new HttpException(
        { message: 'Lỗi không xác định' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('createCourse')
  async createCourse(@Body() createCourseDTO: CourseDTO): Promise<CourseDTO> {
    try {
      const course = await this.courseService.createCourse(createCourseDTO);
      return course;
    } catch (error) {
      if (error instanceof CustomError) {
        throw new HttpException({ message: error.message }, error.statusCode);
      }
      throw new HttpException(
        { message: 'Lỗi không xác định' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('updateCourse/:id')
  async UpdatedCourse(
    @Param('id') courseId: string,
    @Body() createCourseDTO: CourseDTO,
  ): Promise<CourseDTO> {
    try {
      const course = await this.courseService.updateCourse(
        courseId,
        createCourseDTO,
      );
      return course;
    } catch (error) {
      if (error instanceof CustomError) {
        throw new HttpException({ message: error.message }, error.statusCode);
      }
      throw new HttpException(
        { message: 'Lỗi không xác định' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('deleteCourse/:id')
  async deleteCourse(@Param('id') courseId: string): Promise<void> {
    try {
      await this.courseService.deleteCourse(courseId);
    } catch (error) {
      if (error instanceof CustomError) {
        throw new HttpException({ message: error.message }, error.statusCode);
      }
      throw new HttpException(
        { message: 'Lỗi không xác định' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
