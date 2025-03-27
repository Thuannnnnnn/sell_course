import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { SettingService } from './setting.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

@ApiTags('settings')
@Controller('settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Post()
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new setting' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
        },
        carousel: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        isActive: {
          type: 'boolean',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'carousel', maxCount: 10 },
      ],
      {
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB
        },
        fileFilter: (req, file, cb) => {
          if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            cb(null, true);
          } else {
            cb(new Error('Unsupported file type'), false);
          }
        },
      },
    ),
  )
  async create(
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      carousel?: Express.Multer.File[];
    },
    @Body() createSettingDto: CreateSettingDto,
    @Req() req,
  ) {
    if (!req.user) {
      throw new Error('User not found');
    }
    return this.settingService.create(
      createSettingDto,
      req.user,
      files?.logo?.[0],
      files?.carousel,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all settings' })
  findAll() {
    return this.settingService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active setting' })
  findActive() {
    return this.settingService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a setting by id' })
  findOne(@Param('id') id: string) {
    return this.settingService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a setting' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
        },
        carousel: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        isActive: {
          type: 'boolean',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'carousel', maxCount: 10 },
      ],
      {
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB
        },
        fileFilter: (req, file, cb) => {
          if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            cb(null, true);
          } else {
            cb(new Error('Unsupported file type'), false);
          }
        },
      },
    ),
  )
  async update(
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      carousel?: Express.Multer.File[];
    },
    @Body() updateSettingDto: UpdateSettingDto,
  ) {
    return this.settingService.update(
      id,
      updateSettingDto,
      files?.logo?.[0],
      files?.carousel,
    );
  }

  @Delete(':id')
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a setting' })
  remove(@Param('id') id: string) {
    return this.settingService.remove(id);
  }
}
