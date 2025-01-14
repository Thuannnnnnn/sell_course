import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoryResponseDto } from './dto/categoryResponseData.dto';
import { CategoryRequestDto } from './dto/categoryRequestData.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  private toResponseDto(
    category: Category,
    allCategories: Category[],
  ): CategoryResponseDto {
    const children = allCategories
      .filter((cat) => cat.parentId === category.categoryId)
      .map((child) => this.toResponseDto(child, allCategories));

    return {
      categoryId: category.categoryId,
      name: category.name,
      description: category.description || null,
      parentId: category.parentId || null,
      children,
    };
  }

  async createCategory(
    createCategoryDto: CategoryRequestDto,
  ): Promise<CategoryResponseDto> {
    const category = this.categoryRepository.create(createCategoryDto);
    const savedCategory = await this.categoryRepository.save(category);
    return this.toResponseDto(savedCategory, []);
  }

  async getAllCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.find();
    return categories
      .filter((category) => !category.parentId)
      .map((category) => this.toResponseDto(category, categories));
  }

  async getCategoryById(
    categoryId: string,
  ): Promise<CategoryResponseDto | null> {
    const categories = await this.categoryRepository.find();
    const category = categories.find((cat) => cat.categoryId === categoryId);
    if (!category) return null;
    return this.toResponseDto(category, categories);
  }

  async updateCategory(
    categoryId: string,
    updateCategoryDto: CategoryRequestDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOneBy({ categoryId });
    if (!category) throw new Error(`Category with ID ${categoryId} not found`);
    Object.assign(category, updateCategoryDto);
    const updatedCategory = await this.categoryRepository.save(category);
    const categories = await this.categoryRepository.find();
    return this.toResponseDto(updatedCategory, categories);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const category = await this.categoryRepository.findOneBy({ categoryId });
    if (!category) throw new Error(`Category with ID ${categoryId} not found`);
    await this.categoryRepository.remove(category);
  }
}
