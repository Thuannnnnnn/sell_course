import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserNotifyService } from './user_notify.service';
import {
  CreateUserNotifyDto,
  UpdateUserNotifyDto,
} from './dto/user-notify.dto';
import { UserNotify } from './entities/user_Notify.entity';

@ApiTags('User Notifications')
@Controller('user-notify')
export class UserNotifyController {
  constructor(private readonly userNotifyService: UserNotifyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user notification' })
  @ApiResponse({
    status: 201,
    description: 'User notification created successfully',
    type: UserNotify,
  })
  async createUserNotify(
    @Body() createUserNotifyDto: CreateUserNotifyDto,
  ): Promise<UserNotify> {
    return await this.userNotifyService.createUserNotify(createUserNotifyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user notifications' })
  @ApiResponse({
    status: 200,
    description: 'List of user notifications',
    type: [UserNotify],
  })
  async findAllUserNotifies(): Promise<UserNotify[]> {
    return await this.userNotifyService.findAllUserNotifies();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user notification by ID' })
  @ApiResponse({
    status: 200,
    description: 'User notification details',
    type: UserNotify,
  })
  @ApiResponse({ status: 404, description: 'User notification not found' })
  async findUserNotifyById(@Param('id') id: string): Promise<UserNotify> {
    return await this.userNotifyService.findUserNotifyById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user notification by ID' })
  @ApiResponse({
    status: 200,
    description: 'User notification updated successfully',
    type: UserNotify,
  })
  @ApiResponse({ status: 404, description: 'User notification not found' })
  async updateUserNotify(
    @Param('id') id: string,
    @Body() updateUserNotifyDto: UpdateUserNotifyDto,
  ): Promise<UserNotify> {
    return await this.userNotifyService.updateUserNotify(
      id,
      updateUserNotifyDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user notification by ID' })
  @ApiResponse({
    status: 204,
    description: 'User notification deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'User notification not found' })
  async deleteUserNotify(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return await this.userNotifyService.deleteUserNotify(id);
  }
}
