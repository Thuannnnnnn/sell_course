import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the category',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  categoryId: string;

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

  @ApiProperty({
    description: 'List of subcategories',
    type: [CategoryResponseDto],
    required: false,
  })
  children?: CategoryResponseDto[];
}
