import { Injectable, Logger } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import * as util from 'util';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { Contents } from '../contents/entities/contents.entity';

dotenv.config();

const execPromise = util.promisify(exec);

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

  async uploadFile(file: Express.Multer.File, contentId: string) {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const allowedExtension = '.mp4';

    if (fileExtension !== allowedExtension) {
      throw new Error('Only MP4 files are allowed');
    }

    // Tìm nội dung theo contentId
    const content = await this.contentsRepository.findOne({
      where: { contentId },
    });
    if (!content) {
      throw new Error('Content not found');
    }

    const videoFileName = uuidv4();
    const tempDir = './temp';
    const outputDir = './output';

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const tempVideoPath = path.join(tempDir, file.originalname);
    fs.writeFileSync(tempVideoPath, file.buffer);

    const outputPath = path.join(outputDir, `${videoFileName}.m3u8`);
    await this.convertVideoToHLS(tempVideoPath, outputPath);

    const hlsFiles = fs
      .readdirSync(outputDir)
      .filter((file) => file.endsWith('.ts'));

    // Upload HLS files (.ts)
    for (const hlsFile of hlsFiles) {
      const hlsBlobName = `${videoFileName}/${hlsFile}`;
      const hlsBlockBlobClient =
        this.containerClient.getBlockBlobClient(hlsBlobName);
      await hlsBlockBlobClient.uploadFile(path.join(outputDir, hlsFile), {
        blobHTTPHeaders: { blobContentType: 'video/MP2T' },
      });
    }
    const m3u8BlobName = `${videoFileName}/${videoFileName}.m3u8`;
    const m3u8BlockBlobClient =
      this.containerClient.getBlockBlobClient(m3u8BlobName);
    await m3u8BlockBlobClient.uploadFile(outputPath, {
      blobHTTPHeaders: { blobContentType: 'application/vnd.apple.mpegurl' },
    });
    const newVideo = this.videoRepository.create({
      videoId: uuidv4(),
      contents: content,
      title: videoFileName,
      description: 'A description for the video',
      url: `https://sdnmma.blob.core.windows.net/wdp/${m3u8BlobName}`,
      createdAt: new Date(),
    });

    await this.videoRepository.save(newVideo);
    fs.unlinkSync(tempVideoPath);
    hlsFiles.forEach((hlsFile) => fs.unlinkSync(path.join(outputDir, hlsFile)));
    fs.unlinkSync(outputPath);

    return { fileUrl: newVideo.url, newVideo };
  }

  async updateVideo(
    file: Express.Multer.File,
    contentId: string,
    videoId: string,
  ) {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const allowedExtension = '.mp4';

    if (fileExtension !== allowedExtension) {
      throw new Error('Only MP4 files are allowed');
    }

    // Tìm video theo videoId
    const video = await this.videoRepository.findOne({
      where: { videoId },
      relations: ['contents'],
    });
    if (!video) {
      throw new Error('Video not found');
    }

    // Tìm nội dung theo contentId
    const content = await this.contentsRepository.findOne({
      where: { contentId },
    });
    if (!content) {
      throw new Error('Content not found');
    }

    // Xóa các tệp tin HLS cũ trên Azure Blob
    const blobPrefix = `${video.title}/`; // Folder chứa các tệp tin cũ
    for await (const blob of this.containerClient.listBlobsFlat({
      prefix: blobPrefix,
    })) {
      const blockBlobClient = this.containerClient.getBlockBlobClient(
        blob.name,
      );
      await blockBlobClient.delete();
    }

    // Convert video mới và upload lên Azure Blob
    const videoFileName = uuidv4();
    const tempDir = './temp';
    const outputDir = './output';

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const tempVideoPath = path.join(tempDir, file.originalname);
    fs.writeFileSync(tempVideoPath, file.buffer);

    const outputPath = path.join(outputDir, `${videoFileName}.m3u8`);
    await this.convertVideoToHLS(tempVideoPath, outputPath);

    const hlsFiles = fs
      .readdirSync(outputDir)
      .filter((file) => file.endsWith('.ts'));

    // Upload HLS files (.ts)
    for (const hlsFile of hlsFiles) {
      const hlsBlobName = `${videoFileName}/${hlsFile}`;
      const hlsBlockBlobClient =
        this.containerClient.getBlockBlobClient(hlsBlobName);
      await hlsBlockBlobClient.uploadFile(path.join(outputDir, hlsFile), {
        blobHTTPHeaders: { blobContentType: 'video/MP2T' },
      });
    }

    const m3u8BlobName = `${videoFileName}/${videoFileName}.m3u8`;
    const m3u8BlockBlobClient =
      this.containerClient.getBlockBlobClient(m3u8BlobName);
    await m3u8BlockBlobClient.uploadFile(outputPath, {
      blobHTTPHeaders: { blobContentType: 'application/vnd.apple.mpegurl' },
    });

    // Cập nhật thông tin video trong database
    video.contents = content;
    video.title = videoFileName;
    video.url = `https://sdnmma.blob.core.windows.net/wdp/${m3u8BlobName}`;
    video.createdAt = new Date();
    await this.videoRepository.save(video);

    fs.unlinkSync(tempVideoPath);
    hlsFiles.forEach((hlsFile) => fs.unlinkSync(path.join(outputDir, hlsFile)));
    fs.unlinkSync(outputPath);

    return { fileUrl: video.url, updatedVideo: video };
  }

  async deleteVideo(videoId: string) {
    const video = await this.videoRepository.findOne({
      where: { videoId },
      relations: ['contents'],
    });
    if (!video) {
      throw new Error('Video not found');
    }

    // Xóa các tệp tin HLS trên Azure Blob
    const blobPrefix = `${video.title}/`; // Folder chứa các tệp tin của video
    for await (const blob of this.containerClient.listBlobsFlat({
      prefix: blobPrefix,
    })) {
      const blockBlobClient = this.containerClient.getBlockBlobClient(
        blob.name,
      );
      await blockBlobClient.delete();
    }

    // Xóa video khỏi database
    await this.videoRepository.delete({ videoId });

    return { message: 'Video deleted successfully' };
  }

  private async convertVideoToHLS(inputFile: string, outputDir: string) {
    const ffmpegCommand = `ffmpeg -i "${inputFile}" -codec copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls "${outputDir}"`;

    try {
      await execPromise(ffmpegCommand);
    } catch (error) {
      this.logger.error(`Error converting video: ${error}`);
      throw new Error('Video conversion failed');
    }
  }
}
