import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DocsResponseDTO } from './dto/docResponseData.dto';
import { DocsService } from './docs.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DocsRequestDTO } from './dto/docRequestData.dto';

@Controller('api')
export class DocsController {
  constructor(private readonly docsService: DocsService) {}
  @Get('docs/getAll')
  @ApiOperation({ summary: 'Get all Docs' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all Docs.',
    type: [DocsResponseDTO],
  })
  @ApiResponse({
    status: 404,
    description: 'No Docs found.',
  })
  async getAllDocs(): Promise<DocsResponseDTO[]> {
    return await this.docsService.getAllDocs();
  }

  @Post('/docs/create_docs')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'DocInfo', maxCount: 1 }]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({
    status: 201,
    description: 'The course has been successfully created.',
    type: DocsResponseDTO,
  })
  @ApiResponse({ status: 400, description: 'Invalid course data provided.' })
  async createCourse(
    @Body() docs: DocsRequestDTO,
    @UploadedFiles()
    files?: {
      docFile?: Express.Multer.File[];
    },
  ): Promise<void> {
    return await this.docsService.createDocs(docs, files ?? {});
  }
}
