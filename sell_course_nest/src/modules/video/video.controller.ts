import {
  Controller,
  Post,
  Put,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('contentId') contentId: string,
  ) {
    return this.videoService.uploadFile(file, title, contentId);
  }

  @Put('update_script/:videoId')
  @UseInterceptors(FileInterceptor('file'))
  async updateScript(
    @Param('videoId') videoId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.videoService.updateScript(videoId, file);
  }

  @Put('update_video/:videoId')
  @UseInterceptors(FileInterceptor('file'))
  async updateVideo(
    @Param('videoId') videoId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.videoService.updateVideo(videoId, file);
  }

  @Delete('delete/:videoId')
  async deleteVideo(@Param('videoId') videoId: string) {
    return this.videoService.deleteVideo(videoId);
  }
}
