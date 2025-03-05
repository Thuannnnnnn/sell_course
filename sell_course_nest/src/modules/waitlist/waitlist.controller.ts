// waitlist.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { CreateWaitlistDto, UpdateWaitlistDto } from './dto/waitlist.dto';
import { Waitlist } from './entities/waitlist.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

@ApiTags('waitlist')
@Controller('api/waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post('create_waitlist')
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new waitlist entry' })
  @ApiBody({ type: CreateWaitlistDto })
  @ApiResponse({
    status: 201,
    description: 'The waitlist has been successfully created.',
    type: Waitlist,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createWaitlistDto: CreateWaitlistDto): Promise<Waitlist> {
    return this.waitlistService.create(createWaitlistDto);
  }

  @Get('get_all_waitlist')
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all waitlist entries' })
  @ApiResponse({
    status: 200,
    description: 'List of all waitlist entries',
    type: [Waitlist],
  })
  findAll(): Promise<Waitlist[]> {
    return this.waitlistService.findAll();
  }

  @Get('get_waitlist/:userId')
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific waitlist entry' })
  @ApiParam({
    name: 'userId',
    description: 'The UUID of the waitlist entry',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'The waitlist entry',
    type: Waitlist,
  })
  @ApiResponse({ status: 404, description: 'Waitlist not found' })
  findOne(@Param('userId') userId: string): Promise<Waitlist[]> {
    return this.waitlistService.findByUserId(userId);
  }

  @Put('update_waitlist/:waitlistId')
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a waitlist entry' })
  @ApiParam({
    name: 'waitlistId',
    description: 'The UUID of the waitlist entry',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateWaitlistDto })
  @ApiResponse({
    status: 200,
    description: 'The updated waitlist entry',
    type: Waitlist,
  })
  @ApiResponse({ status: 404, description: 'Waitlist not found' })
  update(
    @Param('waitlistId') waitlistId: string,
    @Body() updateWaitlistDto: UpdateWaitlistDto,
  ): Promise<Waitlist> {
    return this.waitlistService.update(waitlistId, updateWaitlistDto);
  }

  @Delete('delete_waitlist/:waitlistId')
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a waitlist entry' })
  @ApiParam({
    name: 'waitlistId',
    description: 'The UUID of the waitlist entry',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 204, description: 'Waitlist successfully deleted' })
  @ApiResponse({ status: 404, description: 'Waitlist not found' })
  remove(@Param('waitlistId') waitlistId: string): Promise<void> {
    return this.waitlistService.remove(waitlistId);
  }
}
