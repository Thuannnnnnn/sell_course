import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Put,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ContentService } from './contents.service';
import { Roles } from '../Auth/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../Auth/roles.guard';
import { UserRole } from '../Auth/user.enum';

@Controller('api')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}
  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('admin/content/view_contentOfLesson/:lessonId')
  async getContentsByLesson(@Param('lessonId') lessonId: string) {
    return await this.contentService.getContentsByLesson(lessonId);
  }

  @Post('admin/contents/view_content')
  async getContentsByContent(@Body() contentIds: string[]) {
    return await this.contentService.getContentsByContentIds(contentIds);
  }

  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete('admin/content/delete_content/:contentId')
  async deleteContent(@Param('contentId') contentId: string) {
    return await this.contentService.deleteContent(contentId);
  }

  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put('admin/content/update_content/:contentId')
  async updateContent(
    @Param('contentId') contentId: string,
    @Body() body: { contentName: string; contentType: string },
  ) {
    try {
      return await this.contentService.updateContent(
        contentId,
        body.contentName,
        body.contentType,
      );
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put('admin/content/update_order')
  async updateContentOrder(
    @Body() body: { contents: { contentId: string; order: number }[] },
  ) {
    try {
      return await this.contentService.updateContentOrder(body.contents);
    } catch (error) {
      throw new HttpException(
        error,
        error instanceof HttpException ? error.getStatus() : 500,
      );
    }
  }
}
