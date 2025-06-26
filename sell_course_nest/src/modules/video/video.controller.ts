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
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('api')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('/instructor/video/create_video')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Create new video',
    description:
      'Upload MP4 video file and create video entry with title and content ID',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Video creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Video created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Video created successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or missing data',
  })
  @ApiResponse({ status: 404, description: 'Content not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('contentId') contentId: string,
  ) {
    return this.videoService.uploadFile(file, title, contentId);
  }

  @Put('/instructor/video/update_script/:videoId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Update video script',
    description: 'Update JSON script file for existing video',
  })
  @ApiParam({ name: 'videoId', description: 'Video ID', type: 'string' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Script file data',
  })
  @ApiResponse({
    status: 200,
    description: 'Script updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Script updated successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format (only JSON allowed)',
  })
  @ApiResponse({ status: 404, description: 'Video not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateScript(
    @Param('videoId') videoId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.videoService.updateScript(videoId, file);
  }

  @Put('/instructor/video/update_video/:videoId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Update video file',
    description:
      'Replace existing video with new MP4 file and regenerate processed files',
  })
  @ApiParam({ name: 'videoId', description: 'Video ID', type: 'string' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Video file data',
  })
  @ApiResponse({
    status: 200,
    description: 'Video updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Video and script updated successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format (only MP4 allowed)',
  })
  @ApiResponse({ status: 404, description: 'Video not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateVideo(
    @Param('videoId') videoId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.videoService.updateVideo(videoId, file);
  }

  @Delete('/instructor/video/delete_video_script/:videoId')
  @ApiOperation({
    summary: 'Delete video and script',
    description:
      'Delete video entry, script, and all related files from Azure storage',
  })
  @ApiParam({ name: 'videoId', description: 'Video ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Video and script deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Video, script and related files deleted successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Video not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteVideoScript(@Param('videoId') videoId: string) {
    return this.videoService.deleteVideoScript(videoId);
  }

  @Get('/instructor/video/view_video_list')
  @ApiOperation({
    summary: 'Get all videos',
    description: 'Retrieve list of all videos in the system',
  })
  @ApiResponse({
    status: 200,
    description: 'Videos retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          videoId: { type: 'string', example: 'uuid-string' },
          title: { type: 'string', example: 'Sample Video Title' },
          description: { type: 'string', example: 'Sample Video Description' },
          url: {
            type: 'string',
            example: 'https://storage.azure.com/video.m3u8',
          },
          urlScript: {
            type: 'string',
            example: 'https://storage.azure.com/script.json',
          },
          createdAt: { type: 'string', format: 'date-time' },
          contents: { type: 'object' },
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async viewVideo() {
    return this.videoService.viewVideo();
  }

  @Get('/video/view_video/:contentId')
  @ApiOperation({
    summary: 'Get video by content ID',
    description: 'Retrieve video details by content ID',
  })
  @ApiParam({ name: 'contentId', description: 'Content ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Video retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        videoId: { type: 'string', example: 'uuid-string' },
        title: { type: 'string', example: 'Sample Video Title' },
        description: { type: 'string', example: 'Sample Video Description' },
        url: {
          type: 'string',
          example: 'https://storage.azure.com/video.m3u8',
        },
        urlScript: {
          type: 'string',
          example: 'https://storage.azure.com/script.json',
        },
        createdAt: { type: 'string', format: 'date-time' },
        contents: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Video not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async viewVideoId(@Param('contentId') contentId: string) {
    return this.videoService.viewVideoById(contentId);
  }
}
