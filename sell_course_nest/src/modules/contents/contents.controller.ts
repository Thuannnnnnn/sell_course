import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Put,
  HttpException,
} from '@nestjs/common';
import { ContentService } from './contents.service';

@Controller('api')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('admin/content/create_content')
  async createContent(
    @Body()
    body: {
      lessonId: string;
      contentName: string;
      contentType: string;
    },
  ) {
    try {
      return await this.contentService.createContent(
        body.lessonId,
        body.contentName,
        body.contentType,
      );
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  @Get('admin/content/view_content/:lessonId')
  async getContentsByLesson(@Param('lessonId') lessonId: string) {
    return await this.contentService.getContentsByLesson(lessonId);
  }

  @Delete('admin/content/delete_content/:contentId')
  async deleteContent(@Param('contentId') contentId: string) {
    return await this.contentService.deleteContent(contentId);
  }
  @Put('admin/content/update_content/:contentId')
  async updateContent(@Param('contentId') contentId: string, @Body() body: { contentName: string }) {
    try {
      return await this.contentService.updateContent(contentId, body.contentName);
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }
}
