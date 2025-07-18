// promotion.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';
import { Promotion } from './entities/promotion.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('promotions')
@Controller('api')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post('admin/promotion/create_promotion')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create a new promotion' })
  @ApiResponse({
    status: 201,
    description: 'Promotion created',
    type: Promotion,
  })
  create(@Body() createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    return this.promotionService.create(createPromotionDto);
  }

  @Get('admin/promotion/show_promotion')
  @ApiOperation({ summary: 'Get all promotions' })
  @ApiResponse({
    status: 200,
    description: 'List of promotions',
    type: [Promotion],
  })
  findAll(): Promise<Promotion[]> {
    return this.promotionService.findAll();
  }

  @Get('promotion/show_promotion_code/:code')
  @ApiOperation({ summary: 'Get a promotion by ID' })
  @ApiResponse({
    status: 200,
    description: 'Promotion details',
    type: Promotion,
  })
  findOne(@Param('code') code: string): Promise<Promotion> {
    return this.promotionService.findOne(code);
  }

  @Get('promotion/validate/:code')
  @ApiOperation({ summary: 'Validate a promotion code' })
  @ApiResponse({
    status: 200,
    description: 'Valid promotion code',
    type: Promotion,
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid or expired promotion code',
  })
  validateCode(
    @Param('code') code: string,
    @Query('courseId') courseId?: string,
  ): Promise<any> {
    return this.promotionService.validatePromotionCode(code, courseId);
  }

  @Put('admin/promotion/update_promotion/:id')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Update a promotion' })
  @ApiResponse({
    status: 200,
    description: 'Updated promotion',
    type: Promotion,
  })
  update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ): Promise<Promotion> {
    return this.promotionService.update(id, updatePromotionDto);
  }

  @Delete('admin/promotion/delete_promotion/:id')
  @ApiOperation({ summary: 'Delete a promotion' })
  @ApiResponse({ status: 200, description: 'Promotion deleted' })
  remove(@Param('id') id: string): Promise<void> {
    return this.promotionService.remove(id);
  }
}
