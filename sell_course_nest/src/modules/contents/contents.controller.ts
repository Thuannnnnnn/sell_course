import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpException,
} from '@nestjs/common';
import { ContentService } from './contents.service';

@Controller('api/content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('create')
  async createContent(
    @Body()
    body: {
      lessonId: string;
      contentType: string;
    },
  ) {
    try {
      return await this.contentService.createContent(
        body.lessonId,
        body.contentType,
      );
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  @Get('lesson/:lessonId')
  async getContentsByLesson(@Param('lessonId') lessonId: string) {
    return await this.contentService.getContentsByLesson(lessonId);
  }

  @Delete(':contentId')
  async deleteContent(@Param('contentId') contentId: string) {
    return await this.contentService.deleteContent(contentId);
  }
}
