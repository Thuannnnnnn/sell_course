import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryRequestDto } from './dto/categoryRequestData.dto';
import { CategoryResponseDto } from './dto/categoryResponseData.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
@Controller('api/')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('admin/categories/create_category')
  @ApiBearerAuth('Authorization')
  @Roles(UserRole.CONTENTMANAGER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'The category has been successfully created.',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid category data provided.',
  })
  async createCategory(
    @Body() createCategoryDto: CategoryRequestDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.createCategory(createCategoryDto);
  }

  @Get('admin/categories/view_category')
  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Get all categories (tree structure)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all categories.',
    type: [CategoryResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'No categories found.',
  })
  async getAllCategories(): Promise<CategoryResponseDto[]> {
    return await this.categoryService.getAllCategories();
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('categories/getById/:id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the category.',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found with the given ID.',
  })
  async getCategoryById(
    @Param('id') id: string,
  ): Promise<CategoryResponseDto | null> {
    return await this.categoryService.getCategoryById(id);
  }

  @Put('admin/categories/update_category/:id')
  @ApiBearerAuth('Authorization')
  @Roles(UserRole.CONTENTMANAGER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully updated.',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found with the given ID.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid category data provided.',
  })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: CategoryRequestDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.updateCategory(id, updateCategoryDto);
  }

  @Delete('admin/categories/delete_category/:id')
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found with the given ID.',
  })
  async deleteCategory(@Param('id') id: string): Promise<{ message: string }> {
    await this.categoryService.deleteCategory(id);
    return { message: `Category with ID ${id} has been deleted successfully.` };
  }
}
