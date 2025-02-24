import {
  Controller,
  Post,
  Put,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
  Get,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('/admin/video/create_video')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('contentId') contentId: string,
  ) {
    return this.videoService.uploadFile(file, title, contentId);
  }

  @Put('/admin/video/update_script/:videoId')
  @UseInterceptors(FileInterceptor('file'))
  async updateScript(
    @Param('videoId') videoId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.videoService.updateScript(videoId, file);
  }

  @Put('/admin/video/update_video/:videoId')
  @UseInterceptors(FileInterceptor('file'))
  async updateVideo(
    @Param('videoId') videoId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.videoService.updateVideo(videoId, file);
  }

  @Delete('/admin/video/delete_video/:videoId')
  async deleteVideo(@Param('videoId') videoId: string) {
    return this.videoService.deleteVideo(videoId);
  }
  @Delete('/admin/video/delete_script/:videoId')
  async deleteScript(@Param('videoId') videoId: string) {
    return this.videoService.deleteScript(videoId);
  }

  @Get('/admin/video/view_video_list')
  async viewVideo() {
    return this.videoService.viewVideo();
  }

  @Get('/video/view_video/:contentId')
  async viewVideoId(@Param('contentId') contentId: string) {
    return this.videoService.viewVideoById(contentId);
  }
}
