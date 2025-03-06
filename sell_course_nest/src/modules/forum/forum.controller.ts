import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ForumService } from './forum.service';
import { Forum } from './entities/forum.entity';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { ForumResponseDto } from './dto/forum-response.dto';

@ApiTags('Forum')
@Controller('api/forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Post('create_forum')
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new forum with image upload' })
  @ApiResponse({
    status: 201,
    description: 'Forum created successfully.',
    type: Forum,
  })
  create(
    @Body() createForumDto: CreateForumDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Forum> {
    return this.forumService.create(createForumDto, file);
  }

  @Get('get_all_forum')
  @ApiOperation({ summary: 'Get all forums' })
  @ApiResponse({ status: 200, description: 'List of forums', type: [Forum] })
  findAll(): Promise<ForumResponseDto[]> {
    return this.forumService.findAll();
  }

  @Get('get_forum/:id')
  @ApiOperation({ summary: 'Get a forum by ID' })
  @ApiResponse({ status: 200, description: 'Forum found', type: Forum })
  findOne(@Param('id') id: string): Promise<ForumResponseDto> {
    return this.forumService.findOne(id);
  }

  @Put('update_forum/:id')
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a forum by ID' })
  @ApiResponse({
    status: 200,
    description: 'Forum updated successfully.',
    type: Forum,
  })
  update(
    @Param('id') id: string,
    @Body() updateForumDto: UpdateForumDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Forum> {
    return this.forumService.update(id, updateForumDto, file);
  }
  @Delete('delete_forum/:id')
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a forum by ID' })
  @ApiResponse({ status: 200, description: 'Forum deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Forum not found.' })
  delete(@Param('id') id: string): Promise<void> {
    return this.forumService.delete(id);
  }
}
