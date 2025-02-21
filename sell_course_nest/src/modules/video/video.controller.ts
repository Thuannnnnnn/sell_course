import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}
  @Post('upload/')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body('contentId') contentId: string,
    @Body('title') title: string,
  ) {
    return this.videoService.uploadFile(file, title, contentId);
  }

  //   @Put('update/:videoId/:contentId')
  //   @UseInterceptors(FileInterceptor('file'))
  //   async updateVideo(
  //     @UploadedFile() file: Express.Multer.File,
  //     @Param('videoId') videoId: string,
  //     @Param('contentId') contentId: string,
  //   ) {
  //     return this.videoService.updateVideo(file, contentId, videoId);
  //   }
  //   @Delete('delete/:videoId')
  //   async deleteVideo(@Param('videoId') videoId: string) {
  //     return this.videoService.deleteVideo(videoId);
  //   }
}
