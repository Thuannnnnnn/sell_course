import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, IsUrl, IsUUID } from 'class-validator';

export class DocsResponseDTO {
  constructor(docsId: string, title: string, url: string, createdAt: Date) {
    this.docsId = docsId;
    this.title = title;
    this.url = url;
    this.createdAt = createdAt;
  }

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
    description: 'URL of the document',
    example: 'https://example.com/docs.pdf',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'Creation date of the document',
    example: '2025-01-14T12:00:00.000Z',
  })
  @IsDateString()
  createdAt: Date;
}
