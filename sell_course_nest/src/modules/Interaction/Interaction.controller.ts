import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InteractionResponseDTO } from './dto/InteractionResponseDTO.dto';
import { InteractionService } from './Interaction.service';
import { InteractionRequestDTO } from './dto/InteractionRequestDTO.dto';

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
  async create(
    @Body() data: InteractionRequestDTO,
  ): Promise<InteractionResponseDTO> {
    return this.interactionService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an interaction' })
  @ApiResponse({ status: 200, type: InteractionResponseDTO })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<InteractionRequestDTO>,
  ): Promise<InteractionResponseDTO> {
    return this.interactionService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an interaction' })
  @ApiResponse({ status: 200 })
  async delete(@Param('id') id: string): Promise<void> {
    return this.interactionService.delete(id);
  }
}
