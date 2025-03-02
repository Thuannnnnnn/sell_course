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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserNotifyService } from './user_notify.service';
import {
  CreateUserNotifyDto,
  UpdateUserNotifyDto,
} from './dto/user-notify.dto';
import { UserNotify } from './entities/user_Notify.entity';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

@ApiTags('User Notifications')
@Controller('api')
export class UserNotifyController {
  constructor(private readonly userNotifyService: UserNotifyService) {}
  @ApiBearerAuth('Authorization')
  @Post('admin/user_notify/create_user_notify')
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
  @ApiBearerAuth('Authorization')
  @Get('/admin/user_notify/get_all_user_notify')
  @ApiOperation({ summary: 'Get all user notifications' })
  @ApiResponse({
    status: 200,
    description: 'List of user notifications',
    type: [UserNotify],
  })
  async findAllUserNotifies(): Promise<UserNotify[]> {
    return await this.userNotifyService.findAllUserNotifies();
  }
  @ApiBearerAuth('Authorization')
  @Get('user_notify/get_user_notify/:id')
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Authorization')
  @Put('user_notify/update_user_notify/:id')
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Authorization')
  @Delete('user_notify/delete_user_notify/:id')
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
