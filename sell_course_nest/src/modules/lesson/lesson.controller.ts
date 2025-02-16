import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
  } from '@nestjs/common';
  import { LessonService } from './lesson.service';
  import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
  import { CreateLessonDTO, UpdateLessonDTO } from './dto/lessonResponseData.dto';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
  } from '@nestjs/swagger';
  @ApiTags('Lesson')
  @ApiBearerAuth()
  @Controller('api/lesson')
  export class LessonController {
    constructor(private readonly lessonService: LessonService) {}

    @UseGuards(JwtAuthGuard)
    @Post('create')
    @ApiOperation({ summary: 'Create a new lesson' })
    @ApiResponse({ status: 201, description: 'Lesson created successfully' })
    async createLesson(@Body() createLessonDto: CreateLessonDTO) {
      return this.lessonService.createLesson(createLessonDto);
    }
    @Get()
    @ApiOperation({ summary: 'Get all lessons' })
    @ApiResponse({ status: 200, description: 'List of lessons' })
    async getLessons() {
      return this.lessonService.getLessons();
    }
    @Get(':lessonId')
    @ApiOperation({ summary: 'Get lesson by ID' })
    @ApiResponse({ status: 200, description: 'Lesson details' })
    async getLessonById(@Param('lessonId') lessonId: string) {
      return this.lessonService.getLessonById(lessonId);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':lessonId')
    @ApiOperation({ summary: 'Update lesson details' })
    @ApiResponse({ status: 200, description: 'Lesson updated successfully' })
    async updateLesson(
      @Param('lessonId') lessonId: string,
      @Body() updateLessonDto: UpdateLessonDTO,
    ) {
      return this.lessonService.updateLesson(lessonId, updateLessonDto);
    }
  
    @UseGuards(JwtAuthGuard)
    @Delete(':lessonId')
    @ApiOperation({ summary: 'Delete a lesson' })
    @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
    async deleteLesson(@Param('lessonId') lessonId: string) {
      return this.lessonService.deleteLesson(lessonId);
    }
  }
  