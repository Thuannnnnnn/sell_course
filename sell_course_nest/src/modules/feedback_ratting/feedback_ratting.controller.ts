// src/feedback-ratting/feedback-ratting.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common'; // Add Delete
import { FeedbackRattingService } from './feedback_ratting.service';
import { CreateFeedbackRattingDto } from './dto/create-feedback-ratting.dto';
import { UpdateFeedbackRattingDto } from './dto/update-feedback-ratting.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FeedbackRatting } from './entities/feedback_ratting.entity';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

@ApiTags('feedback-ratting')
@Controller('feedback-ratting')
export class FeedbackRattingController {
  constructor(
    private readonly feedbackRattingService: FeedbackRattingService,
  ) {}

  @Post()
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create a new feedback rating' })
  @ApiResponse({
    status: 201,
    description: 'Feedback created successfully',
    type: FeedbackRatting,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: CreateFeedbackRattingDto })
  create(@Body() createFeedbackRattingDto: CreateFeedbackRattingDto) {
    return this.feedbackRattingService.create(createFeedbackRattingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all feedback ratings' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval',
    type: [FeedbackRatting],
  })
  findAll() {
    return this.feedbackRattingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feedback rating by course ID' })
  @ApiParam({
    name: 'id',
    description: 'Feedback Rating course ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval',
    type: FeedbackRatting,
  })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  findOne(@Param('id') id: string) {
    return this.feedbackRattingService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Update a feedback rating' })
  @ApiParam({ name: 'id', description: 'Feedback Rating ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Feedback updated successfully',
    type: FeedbackRatting,
  })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  @ApiBody({ type: UpdateFeedbackRattingDto })
  update(
    @Param('id') id: string,
    @Body() updateFeedbackRattingDto: UpdateFeedbackRattingDto,
  ) {
    return this.feedbackRattingService.update(id, updateFeedbackRattingDto);
  }
  @Delete(':id')
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a feedback rating' })
  @ApiParam({ name: 'id', description: 'Feedback Rating ID', type: String })
  @ApiResponse({ status: 200, description: 'Feedback deleted successfully' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  remove(@Param('id') id: string) {
    return this.feedbackRattingService.remove(id);
  }
}
