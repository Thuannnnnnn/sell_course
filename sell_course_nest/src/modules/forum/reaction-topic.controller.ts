import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ReactionTopicService } from './reaction_topic.service';
import { CreateReactionTopicDto } from './dto/reaction-topic.dto';
import { ReactionTopic } from './entities/reaction_topic.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

@ApiTags('Reaction Topic')
@Controller('reaction-topic')
export class ReactionTopicController {
  constructor(private readonly reactionTopicService: ReactionTopicService) {}

  @Post()
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo một reaction mới cho forum' })
  @ApiBody({ type: CreateReactionTopicDto })
  @ApiResponse({
    status: 201,
    description: 'Reaction đã được tạo thành công',
    type: ReactionTopic,
  })
  @ApiResponse({ status: 409, description: 'User đã react cho forum này rồi' })
  @ApiResponse({ status: 404, description: 'User hoặc Forum không tồn tại' })
  async createReaction(
    @Body() createReactionDto: CreateReactionTopicDto,
  ): Promise<ReactionTopic> {
    return this.reactionTopicService.createReaction(createReactionDto);
  }

  @Get(':forumId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách reactions của một forum' })
  @ApiParam({ name: 'forumId', description: 'ID của forum', type: String })
  @ApiResponse({
    status: 200,
    description: 'Danh sách reactions',
    type: [ReactionTopic],
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy reactions' })
  async getReactionsByForum(
    @Param('forumId') forumId: string,
  ): Promise<ReactionTopic[]> {
    return this.reactionTopicService.findReactionsByForum(forumId);
  }

  @Delete(':userId/:forumId')
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa reaction của user cho forum' })
  @ApiParam({ name: 'userId', description: 'ID của user', type: String })
  @ApiParam({ name: 'forumId', description: 'ID của forum', type: String })
  @ApiResponse({ status: 204, description: 'Reaction đã được xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy reaction' })
  async deleteReaction(
    @Param('userId') userId: string,
    @Param('forumId') forumId: string,
  ): Promise<void> {
    return this.reactionTopicService.deleteReaction(userId, forumId);
  }
}
