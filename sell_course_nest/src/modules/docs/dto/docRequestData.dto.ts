import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';
import { Express } from 'express';

export class DocsRequestDTO {
  @ApiProperty({
    description: 'Unique identifier for the document',
    example: '1234-5678-91011',
  })
  @IsUUID()
  docsId: string;

  @ApiProperty({
    description: 'Title of the document',
    example: 'API Documentation',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'File upload for the document',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  file?: Express.Multer.File;

  @ApiProperty({
    description: 'Contents ID associated with the document',
    example: 'abcd-1234-efgh-5678',
  })
  @IsUUID()
  contentsId: string;

  createdAt: Date;
}
