import { ApiProperty } from '@nestjs/swagger';

export class CategoryRequestDto {
  @ApiProperty({
    description: 'Name of the category',
    example: 'Electronics',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the category',
    example: 'All kinds of electronic devices',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Parent category ID, if this category is a subcategory',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  parentId?: string;
}
