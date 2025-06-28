import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import * as dotenv from 'dotenv';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { Contents } from '../contents/entities/contents.entity';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import fs from 'fs';
import os from 'os';
import extract from 'extract-zip';
import { Readable } from 'stream';
import * as tar from 'tar';
import {
  azureDelete,
  azureUploadFolder,
  azureUploadVideo,
} from 'src/utilities/azure.service';
import { v4 as uuidv4 } from 'uuid';

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
    const content = await this.contentsRepository.findOne({
      where: { contentId },
    });
    const videoId = uuidv4();
    if (!content) return { message: 'Content not found' };
    const createdAt = new Date();
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (fileExtension !== '.mp4') throw new Error('Only MP4 files are allowed');

    const formData = new FormData();
    formData.append('video', file.buffer, file.originalname);

    const response = await axios.post(
      `${process.env.URL_n8n}/file_video`,
      formData,
      {
        headers: formData.getHeaders(),
        responseType: 'arraybuffer',
      },
    );

    if (
      response.status !== 200 ||
      !response.data ||
      response.data.byteLength === 0
    )
      throw new Error('Invalid response from n8n');

    const tmpDir = path.join(os.tmpdir(), 'n8n-output');
    await fs.promises.mkdir(tmpDir, { recursive: true });
    const razPath = path.join(tmpDir, `${Date.now()}.raz`);
    await fs.promises.writeFile(razPath, Buffer.from(response.data));

    const fileStats = await fs.promises.stat(razPath);
    if (fileStats.size === 0) throw new Error('Saved .raz file is empty');

    const fileBuffer = await fs.promises.readFile(razPath);
    const zipSignature = Buffer.from([0x50, 0x4b]);
    const tarSignature = fileBuffer.subarray(257, 262).toString('ascii');
    const gzipSignature = Buffer.from([0x1f, 0x8b]);

    const isZip = fileBuffer.subarray(0, 2).equals(zipSignature);
    const isTar = tarSignature === 'ustar';
    const isGzip = fileBuffer.subarray(0, 2).equals(gzipSignature);

    const extractPath = path.join(tmpDir, `unzipped_${Date.now()}`);
    await fs.promises.mkdir(extractPath, { recursive: true });

    try {
      if (isZip) await extract(razPath, { dir: extractPath });
      else if (isTar || isGzip)
        await tar.x({ file: razPath, cwd: extractPath, strip: 0 });
      else {
        try {
          await tar.x({ file: razPath, cwd: extractPath, strip: 0 });
        } catch {
          await extract(razPath, { dir: extractPath });
        }
      }
    } catch (extractError: any) {
      throw new Error(`Failed to extract .raz file: ${extractError.message}`);
    }

    const tmpFolder = path.join(extractPath, 'tmp');
    if (!fs.existsSync(tmpFolder)) throw new Error('Missing tmp folder');

    const outputFolder = path.join(tmpFolder, 'output');
    if (!fs.existsSync(outputFolder)) throw new Error('Missing output folder');

    const outputFiles = await fs.promises.readdir(outputFolder);
    if (!outputFiles.find((f) => f.endsWith('.m3u8')))
      throw new Error('Missing .m3u8 file in output folder');

    const tmpFiles = await fs.promises.readdir(tmpFolder);
    let jsonFile = tmpFiles.find((f) => f.endsWith('.json'));
    if (!jsonFile) {
      const jsonFolder = path.join(tmpFolder, 'json');
      if (fs.existsSync(jsonFolder)) {
        const jsonFolderFiles = await fs.promises.readdir(jsonFolder);
        jsonFile = jsonFolderFiles.find((f) => f.endsWith('.json'));
      }
    }

    if (!jsonFile) throw new Error('Missing .json file');

    const azureFolderPrefix = `videos/${videoId}/`;
    const uploadedOutputUrls = await azureUploadFolder(
      outputFolder,
      azureFolderPrefix,
    );
    // Upload JSON file
    const jsonPath = fs.existsSync(path.join(tmpFolder, jsonFile))
      ? path.join(tmpFolder, jsonFile)
      : path.join(tmpFolder, 'json', jsonFile);

    const jsonBuffer = await fs.promises.readFile(jsonPath);
    const jsonFileLike: Express.Multer.File = {
      fieldname: 'file',
      originalname: jsonFile,
      encoding: '7bit',
      mimetype: 'application/json',
      buffer: jsonBuffer,
      size: jsonBuffer.length,
      stream: Readable.from(jsonBuffer),
      destination: '',
      filename: jsonFile,
      path: '',
    };
    const jsonUrl = await azureUploadVideo(
      jsonFileLike,
      `${azureFolderPrefix}${jsonFile}`,
    );

    const video = this.videoRepository.create({
      videoId,
      title,
      description: title,
      url:
        uploadedOutputUrls.find((u) => u.endsWith('.m3u8')) ||
        uploadedOutputUrls[0],
      urlScript: jsonUrl,
      createdAt,
      contents: content,
    });

    await this.videoRepository.save(video);

    try {
      await fs.promises.unlink(razPath);
      await fs.promises.rm(extractPath, { recursive: true });
    } catch {}
  }

  async updateScript(videoId: string, file: Express.Multer.File) {
    // Kiểm tra video có tồn tại không
    const video = await this.videoRepository.findOne({
      where: { videoId },
    });
    if (!video) throw new Error('Video not found');

    // Kiểm tra file có phải JSON không
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (fileExtension !== '.json') {
      throw new Error('Only JSON files are allowed for script update');
    }

    // Xóa JSON file cũ nếu có
    if (video.urlScript) {
      try {
        // Extract blob name from URL
        const url = new URL(video.urlScript);
        const blobName = url.pathname.substring(1); // Remove leading slash
        await azureDelete(blobName);
      } catch (error) {
        console.warn('Failed to delete old script file:', error);
      }
    }

    // Upload JSON file mới
    const azureFolderPrefix = `videos/${videoId}/`;
    const newJsonUrl = await azureUploadVideo(
      file,
      `${azureFolderPrefix}${file.originalname}`,
    );

    // Cập nhật urlScript trong database
    await this.videoRepository.update({ videoId }, { urlScript: newJsonUrl });

    return { message: 'Script updated successfully' };
  }

  async updateVideo(videoId: string, file: Express.Multer.File) {
    // Kiểm tra video có tồn tại không
    const video = await this.videoRepository.findOne({
      where: { videoId },
    });
    if (!video) throw new Error('Video not found');

    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (fileExtension !== '.mp4') {
      throw new Error('Only MP4 files are allowed');
    }

    // Xóa các files cũ trước khi upload mới
    await this.deleteVideoFiles(videoId);

    // Sử dụng n8n để process video mới (giống như uploadFile)
    const formData = new FormData();
    formData.append('video', file.buffer, file.originalname);

    const response = await axios.post(
      `${process.env.URL_n8n}/file_video`,
      formData,
      {
        headers: formData.getHeaders(),
        responseType: 'arraybuffer',
      },
    );

    if (
      response.status !== 200 ||
      !response.data ||
      response.data.byteLength === 0
    )
      throw new Error('Invalid response from n8n');

    const tmpDir = path.join(os.tmpdir(), 'n8n-output');
    await fs.promises.mkdir(tmpDir, { recursive: true });
    const razPath = path.join(tmpDir, `${Date.now()}.raz`);
    await fs.promises.writeFile(razPath, Buffer.from(response.data));

    const fileStats = await fs.promises.stat(razPath);
    if (fileStats.size === 0) throw new Error('Saved .raz file is empty');

    const fileBuffer = await fs.promises.readFile(razPath);
    const zipSignature = Buffer.from([0x50, 0x4b]);
    const tarSignature = fileBuffer.subarray(257, 262).toString('ascii');
    const gzipSignature = Buffer.from([0x1f, 0x8b]);

    const isZip = fileBuffer.subarray(0, 2).equals(zipSignature);
    const isTar = tarSignature === 'ustar';
    const isGzip = fileBuffer.subarray(0, 2).equals(gzipSignature);

    const extractPath = path.join(tmpDir, `unzipped_${Date.now()}`);
    await fs.promises.mkdir(extractPath, { recursive: true });

    try {
      if (isZip) await extract(razPath, { dir: extractPath });
      else if (isTar || isGzip)
        await tar.x({ file: razPath, cwd: extractPath, strip: 0 });
      else {
        try {
          await tar.x({ file: razPath, cwd: extractPath, strip: 0 });
        } catch {
          await extract(razPath, { dir: extractPath });
        }
      }
    } catch (extractError: any) {
      throw new Error(`Failed to extract .raz file: ${extractError.message}`);
    }

    const tmpFolder = path.join(extractPath, 'tmp');
    if (!fs.existsSync(tmpFolder)) throw new Error('Missing tmp folder');

    const outputFolder = path.join(tmpFolder, 'output');
    if (!fs.existsSync(outputFolder)) throw new Error('Missing output folder');

    const outputFiles = await fs.promises.readdir(outputFolder);
    if (!outputFiles.find((f) => f.endsWith('.m3u8')))
      throw new Error('Missing .m3u8 file in output folder');

    const tmpFiles = await fs.promises.readdir(tmpFolder);
    let jsonFile = tmpFiles.find((f) => f.endsWith('.json'));
    if (!jsonFile) {
      const jsonFolder = path.join(tmpFolder, 'json');
      if (fs.existsSync(jsonFolder)) {
        const jsonFolderFiles = await fs.promises.readdir(jsonFolder);
        jsonFile = jsonFolderFiles.find((f) => f.endsWith('.json'));
      }
    }

    if (!jsonFile) throw new Error('Missing .json file');

    // Upload files mới với cùng videoId
    const azureFolderPrefix = `videos/${videoId}/`;
    const uploadedOutputUrls = await azureUploadFolder(
      outputFolder,
      azureFolderPrefix,
    );

    // Upload JSON file
    const jsonPath = fs.existsSync(path.join(tmpFolder, jsonFile))
      ? path.join(tmpFolder, jsonFile)
      : path.join(tmpFolder, 'json', jsonFile);

    const jsonBuffer = await fs.promises.readFile(jsonPath);
    const jsonFileLike: Express.Multer.File = {
      fieldname: 'file',
      originalname: jsonFile,
      encoding: '7bit',
      mimetype: 'application/json',
      buffer: jsonBuffer,
      size: jsonBuffer.length,
      stream: Readable.from(jsonBuffer),
      destination: '',
      filename: jsonFile,
      path: '',
    };
    const jsonUrl = await azureUploadVideo(
      jsonFileLike,
      `${azureFolderPrefix}${jsonFile}`,
    );

    // Cập nhật video trong database
    await this.videoRepository.update(
      { videoId },
      {
        url:
          uploadedOutputUrls.find((u) => u.endsWith('.m3u8')) ||
          uploadedOutputUrls[0],
        urlScript: jsonUrl,
      },
    );

    // Cleanup
    try {
      await fs.promises.unlink(razPath);
      await fs.promises.rm(extractPath, { recursive: true });
    } catch {}

    return { message: 'Video and script updated successfully' };
  }

  async deleteVideoScript(videoId: string) {
    // Kiểm tra video có tồn tại không
    const video = await this.videoRepository.findOne({
      where: { videoId },
    });
    if (!video) throw new Error('Video not found');

    let message = '';

    // Xóa toàn bộ video, script và files từ Azure
    await this.deleteVideoFiles(videoId);
    // Xóa record từ database
    await this.videoRepository.delete({ videoId: videoId });
    message = 'Video, script and related files deleted successfully';

    return { message };
  }

  async viewVideo(): Promise<Video[]> {
    try {
      return await this.videoRepository.find({
        relations: ['contents'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error retrieving video list',
        error,
      );
    }
  }

  async viewVideoById(videoId: string): Promise<Video> {
    try {
      const video = await this.videoRepository.findOne({
        where: { videoId: videoId },
      });
      if (!video) {
        throw new NotFoundException(
          `Video with videoId '${videoId}' not found`,
        );
      }
      return video;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error retrieving video by ID');
    }
  }

  async viewVideoByContentId(contentId: string): Promise<Video> {
    try {
      const video = await this.videoRepository
        .createQueryBuilder('video')
        .innerJoinAndSelect('video.contents', 'contents')
        .where('contents.contentId = :contentId', { contentId })
        .getOne();

      if (!video) {
        throw new NotFoundException(
          `Video with contentId '${contentId}' not found`,
        );
      }

      return video;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error retrieving video by content ID',
      );
    }
  }

  // Helper method để xóa tất cả files của video từ Azure
  private async deleteVideoFiles(videoId: string) {
    try {
      // Lấy folder prefix (videos/videoId/)
      const folderPrefix = `videos/${videoId}/`;

      // Xóa tất cả files trong folder này
      // Note: Azure SDK không có direct method để xóa folder,
      // nhưng ta có thể xóa từng file dựa trên pattern
      const containerClient = this.blobServiceClient.getContainerClient(
        process.env.AZURE_STORAGE_CONTAINER_NAME || 'default-container',
      );

      // List tất cả blobs có prefix này
      const blobs = containerClient.listBlobsFlat({ prefix: folderPrefix });

      for await (const blob of blobs) {
        try {
          await azureDelete(blob.name);
        } catch (error) {
          console.warn('Failed to delete blob:', blob.name, error);
        }
      }
    } catch (error) {
      console.warn('Failed to delete video files:', error);
    }
  }
}
