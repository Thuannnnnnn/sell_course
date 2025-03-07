import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DiscussionService } from './discussion.service';
import { CreateDiscussionDto, UpdateDiscussionDto } from './dto/discussion.dto';
import { Discussion } from './entities/discussion.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Discussion')
@Controller('discussion')
export class DiscussionController {
  constructor(private readonly discussionService: DiscussionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo một bình luận mới cho forum' })
  @ApiBody({ type: CreateDiscussionDto })
  @ApiResponse({
    status: 201,
    description: 'Bình luận đã được tạo thành công',
    type: Discussion,
  })
  @ApiResponse({ status: 404, description: 'User hoặc Forum không tồn tại' })
  async create(
    @Body() createDiscussionDto: CreateDiscussionDto,
  ): Promise<Discussion> {
    return this.discussionService.create(createDiscussionDto);
  }

  // Read: Get all discussions by forum
  @Get('forum/:forumId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách bình luận của một forum' })
  @ApiParam({ name: 'forumId', description: 'ID của forum', type: String })
  @ApiResponse({
    status: 200,
    description: 'Danh sách bình luận',
    type: [Discussion],
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bình luận' })
  async getDiscussionsByForum(
    @Param('forumId') forumId: string,
  ): Promise<Discussion[]> {
    return this.discussionService.findByForum(forumId);
  }

  // Read: Get one discussion by ID
  @Get(':discussionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy thông tin một bình luận theo ID' })
  @ApiParam({
    name: 'discussionId',
    description: 'ID của bình luận',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin bình luận',
    type: Discussion,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bình luận' })
  async getDiscussion(
    @Param('discussionId') discussionId: string,
  ): Promise<Discussion> {
    return this.discussionService.findOne(discussionId);
  }

  // Update
  @Patch(':discussionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật nội dung một bình luận' })
  @ApiParam({
    name: 'discussionId',
    description: 'ID của bình luận',
    type: String,
  })
  @ApiBody({ type: UpdateDiscussionDto })
  @ApiResponse({
    status: 200,
    description: 'Bình luận đã được cập nhật thành công',
    type: Discussion,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bình luận' })
  async updateDiscussion(
    @Param('discussionId') discussionId: string,
    @Body() updateDiscussionDto: UpdateDiscussionDto,
  ): Promise<Discussion> {
    return this.discussionService.update(discussionId, updateDiscussionDto);
  }

  // Delete
  @Delete(':discussionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa một bình luận' })
  @ApiParam({
    name: 'discussionId',
    description: 'ID của bình luận',
    type: String,
  })
  @ApiResponse({ status: 204, description: 'Bình luận đã được xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bình luận' })
  async deleteDiscussion(
    @Param('discussionId') discussionId: string,
  ): Promise<void> {
    return this.discussionService.delete(discussionId);
  }
}
