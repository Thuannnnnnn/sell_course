import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
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
  async createReaction(@Body() dto: CreateReactionQaDto) {
    return this.reactionQaService.createReaction(dto);
  }

  @Get(':qaStudyId')
  @ApiOperation({ summary: 'Get all reactions for a QA Study' })
  async getReactions(@Param('qaStudyId') qaStudyId: string) {
    return this.reactionQaService.findReactionsByQa(qaStudyId);
  }
}
