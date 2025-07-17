import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { DocsResponseDTO } from './dto/docResponseData.dto';
import { DocsService } from './docs.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DocsRequestDTO } from './dto/docRequestData.dto';

@Controller('api')
export class DocsController {
  constructor(private readonly docsService: DocsService) {}
  @Get('/admin/docs/getAll')
  @ApiBearerAuth('Authorization')
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

  @Get('/admin/docs/view_doc/:id')
  @ApiBearerAuth('Authorization')
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
  async getDocByContentIdAmin(
    @Param('id') contentsId: string,
  ): Promise<DocsResponseDTO> {
    return await this.docsService.getByContentId(contentsId);
  }

  @Get('/docs/view_doc/:id')
  @ApiBearerAuth('Authorization')
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
  async getDocByContentId(
    @Param('id') contentsId: string,
  ): Promise<DocsResponseDTO> {
    return await this.docsService.getByContentId(contentsId);
  }

  @Post('/admin/docs/create_docs')
  @ApiBearerAuth('Authorization')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'file', maxCount: 1 }]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new doc' })
  @ApiResponse({
    status: 201,
    description: 'The doc has been successfully created.',
    type: DocsResponseDTO,
  })
  @ApiResponse({ status: 400, description: 'Invalid doc data provided.' })
  @ApiResponse({
    status: 415,
    description: 'Unsupported file type. Only PDF, DOC, and DOCX are allowed.',
  })
  async createCourse(
    @Body() docs: DocsRequestDTO,
    @UploadedFiles()
    file?: { file?: Express.Multer.File[] },
  ): Promise<{ url: string }> {
    return await this.docsService.createDocs(docs, file);
  }

  @ApiBearerAuth('Authorization')
  @Put('/admin/docs/update_docs/:id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'file', maxCount: 1 }]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an existing docs' })
  @ApiResponse({
    status: 200,
    description: 'The docs has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'docs not found with the given ID.',
  })
  @ApiResponse({ status: 400, description: 'Invalid course data provided.' })
  async updateCourse(
    @Param('id') docsId: string,
    @Body() updateData: DocsRequestDTO,
    @UploadedFiles()
    file?: { file?: Express.Multer.File[] },
  ): Promise<{ url: string }> {
    return await this.docsService.updatedDocs(docsId, updateData, file);
  }

  @ApiBearerAuth('Authorization')
  @Delete('admin/docs/delete_doc/:id')
  @ApiOperation({ summary: 'Delete a doc by ID' })
  @ApiResponse({
    status: 200,
    description: 'The doc has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'doc not found with the given ID.',
  })
  async deleteCourse(@Param('id') docsId: string): Promise<void> {
    await this.docsService.deleteDoc(docsId);
  }
}
