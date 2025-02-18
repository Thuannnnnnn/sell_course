import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Course_purchaseService } from './course_purchase.service';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { CoursePurchasedDTO } from './dto/courseResponseData.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Course Purchase')
@ApiBearerAuth('Authorization')
@Controller('api/course_purchased')
export class Course_purchaseController {
  constructor(
    private readonly coursePurchasedService: Course_purchaseService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiOperation({
    summary: 'Create course purchase',
    description: 'Creates a purchase record for given courses and user',
  })
  @ApiResponse({ status: 201, description: 'Purchase created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        courseIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['course-123', 'course-456'],
        },
      },
    },
  })
  async createCoursePurchased(
    @Body() body: { email: string; courseIds: string[] },
  ) {
    const { email, courseIds } = body;

    if (!email || !courseIds || courseIds.length === 0) {
      throw new HttpException('Bad Request', 400);
    }

    try {
      await this.coursePurchasedService.createCoursePurchased(email, courseIds);
      throw new HttpException('OK', 200);
    } catch (error) {
      throw new HttpException('Server ' + error, 500);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Get all course purchases for user',
    description: 'Returns all purchased courses for the logged-in user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of purchased courses',
    type: [CoursePurchasedDTO],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllCoursePurchased(@Req() req): Promise<CoursePurchasedDTO[]> {
    const userEmail = req.user.email;
    return this.coursePurchasedService.getAllCoursePurchase(userEmail);
  }

  @Get(':courseId/:email')
  @ApiOperation({
    summary: 'Get course purchase by courseId',
    description: 'Returns details of a specific purchased course',
  })
  @ApiResponse({
    status: 200,
    description: 'Course purchase details',
    type: CoursePurchasedDTO,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Course purchase not found' })
  @ApiParam({
    name: 'courseId',
    required: true,
    example: 'course-123',
    description: 'ID of the purchased course',
  })
  async getCoursePurchaseByCourseId(
    @Param('courseId') courseId: string,
    @Param('email') email: string,
  ): Promise<{
    code: number;
    data: CoursePurchasedDTO | null;
    message: string;
  }> {
    if (!courseId) {
      throw new HttpException('Bad Request', 400);
    }

    return this.coursePurchasedService.getCoursePurchaseByCourseId(
      email,
      courseId,
    );
  }
}
