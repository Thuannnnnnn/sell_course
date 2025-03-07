import { Injectable, Logger } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { Contents } from '../contents/entities/contents.entity';
import axios from 'axios';
import FormData from 'form-data';

dotenv.config();

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  private blobServiceClient: BlobServiceClient;
  private containerClient;

  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(Contents)
    private contentsRepository: Repository<Contents>,
  ) {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING,
    );
    this.containerClient = this.blobServiceClient.getContainerClient(
      process.env.AZURE_STORAGE_CONTAINER_NAME,
    );
  }

  async uploadFile(
    file: Express.Multer.File,
    title: string,
    contentId: string,
  ) {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (fileExtension !== '.mp4') {
      throw new Error('Only MP4 files are allowed');
    }

    const content = await this.contentsRepository.findOne({
      where: { contentId },
    });
    if (!content) {
      throw new Error('Content not found');
    }

    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);
    formData.append('content_id', contentId);
    console.log(process.env.URL_PYTHON);
    const response = await axios.post(
      `${process.env.URL_PYTHON}/upload`,
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    if (!response.data.fileUrl) {
      throw new Error('Failed to process video');
    }

    const newVideo = this.videoRepository.create({
      videoId: response.data.video_id,
      contents: content,
      title: title,
      description: 'Processed video',
      url: response.data.fileUrl,
      urlScript: response.data.subtitlesUrl,
      createdAt: new Date(),
    });

    await this.videoRepository.save(newVideo);
    return { fileUrl: newVideo.url, newVideo };
  }

  async updateScript(videoId: string, file: Express.Multer.File) {
    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);

    await axios.put(
      `${process.env.URL_PYTHON}/update_script/${videoId}`,
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    return { message: 'Subtitles updated successfully' };
  }

  async updateVideo(videoId: string, file: Express.Multer.File) {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (fileExtension !== '.mp4') {
      throw new Error('Only MP4 files are allowed');
    }

    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);

    await axios.put(
      `${process.env.URL_PYTHON}/update_video/${videoId}`,
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    return { message: 'Video updated successfully' };
  }

  async deleteVideo(videoId: string) {
    await axios.delete(`${process.env.URL_PYTHON}/delete_video/${videoId}`);
    await this.videoRepository.delete({ videoId: videoId });
    return { message: 'Video and related files deleted successfully' };
  }

  async deleteScript(videoId: string) {
    await axios.delete(`${process.env.URL_PYTHON}/delete_script/${videoId}`);
    await this.videoRepository.update({ videoId }, { urlScript: null });
    return { message: 'Script files deleted successfully' };
  }

  async viewVideo(): Promise<Video> {
    const videoList = await this.videoRepository.find();
    if (videoList.length === 0) {
      throw new Error('No videos found');
    }
    return videoList[0];
  }
  async viewVideoById(contentId: string): Promise<Video> {
    const video = await this.videoRepository.findOne({
      where: { contents: { contentId } },
    });

    return video;
  }
}
