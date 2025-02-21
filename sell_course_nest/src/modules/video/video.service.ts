import { Logger } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { Contents } from '../contents/entities/contents.entity';
import axios from 'axios';
dotenv.config();

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
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append('file', blob, file.originalname);
    const response = await axios.post('http://0.0.0.0:8000/upload', formData);
    if (!response.data.fileUrl) {
      throw new Error('Failed to process video');
    }

    const newVideo = this.videoRepository.create({
      videoId: file.originalname,
      contents: content,
      title: title,
      description: 'Processed video',
      url: response.data.fileUrl,
      createdAt: new Date(),
    });

    await this.videoRepository.save(newVideo);

    return { fileUrl: newVideo.url, newVideo };
  }
}
