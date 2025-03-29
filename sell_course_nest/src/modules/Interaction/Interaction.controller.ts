import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InteractionResponseDTO } from './dto/InteractionResponseDTO.dto';
import { InteractionService } from './Interaction.service';
import { Interaction } from './entities/Interaction.entity';

@ApiTags('Interactions')
@Controller('interactions')
export class InteractionController {
  constructor(private readonly interactionService: InteractionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all interactions' })
  @ApiResponse({ status: 200, type: [InteractionResponseDTO] })
  async findAll(): Promise<InteractionResponseDTO[]> {
    return this.interactionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an interaction by ID' })
  @ApiResponse({ status: 200, type: InteractionResponseDTO })
  async findOne(@Param('id') id: string): Promise<InteractionResponseDTO> {
    return this.interactionService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new interaction' })
  @ApiResponse({ status: 201, type: InteractionResponseDTO })
  async create(@Body() data: Interaction): Promise<InteractionResponseDTO> {
    return this.interactionService.createOrUpdate(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an interaction' })
  @ApiResponse({ status: 200 })
  async delete(@Param('id') id: string): Promise<void> {
    return this.interactionService.delete(id);
  }
}
