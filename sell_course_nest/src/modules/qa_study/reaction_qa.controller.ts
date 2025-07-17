import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReactionQaService } from './reaction_qa.service';
import { CreateReactionQaDto } from './dto/reaction_qa.dto';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

@ApiTags('Reaction QA')
@ApiBearerAuth()
@Controller('reaction-qa')
export class ReactionQaController {
  constructor(private readonly reactionQaService: ReactionQaService) {}

  @Post()
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'React to a QA Study' })
  async createReaction(@Body() dto: CreateReactionQaDto, courseId: string) {
    return this.reactionQaService.createReaction(dto, courseId);
  }

  @Get(':qaStudyId')
  @ApiOperation({ summary: 'Get all reactions for a QA Study' })
  async getReactions(@Param('qaStudyId') qaStudyId: string) {
    return this.reactionQaService.findReactionsByQa(qaStudyId);
  }

  @Delete(':qaStudyId/:userId/:courseId')
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a reaction from a QA Study' })
  async deleteReaction(
    @Param('qaStudyId') qaStudyId: string,
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
  ) {
    await this.reactionQaService.deleteReaction(userId, qaStudyId, courseId);
    return { message: 'Reaction deleted successfully' };
  }
}
