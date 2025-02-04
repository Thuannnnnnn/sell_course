import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoryResponseDto } from './dto/categoryResponseData.dto';
import { CategoryRequestDto } from './dto/categoryRequestData.dto';
import { v4 as uuidv4 } from 'uuid';

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
    const { parentId, ...data } = createCategoryDto;

    if (parentId) {
      const parentCategory = await this.categoryRepository.findOneBy({
        categoryId: parentId,
      });
      if (!parentCategory) {
        throw new HttpException(
          `Parent category with ID ${parentId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
    }

    const category = this.categoryRepository.create({
      categoryId: uuidv4(),
      ...data,
      parentId: parentId || null,
    });

    const savedCategory = await this.categoryRepository.save(category);
    const allCategories = await this.categoryRepository.find();
    return this.toResponseDto(savedCategory, allCategories);
  }

  async getAllCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.find();
    return categories;
    // .filter((category) => !category.parentId)
    // .map((category) => this.toResponseDto(category, categories));
  }

  async getCategoryById(
    categoryId: string,
  ): Promise<CategoryResponseDto | null> {
    const categories = await this.categoryRepository.find();
    const category = categories.find((cat) => cat.categoryId === categoryId);
    if (!category) {
      throw new HttpException(
        `Category with ID ${categoryId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return this.toResponseDto(category, categories);
  }

  async updateCategory(
    categoryId: string,
    updateCategoryDto: CategoryRequestDto,
  ): Promise<CategoryResponseDto> {
    const { parentId, ...data } = updateCategoryDto;
    const category = await this.categoryRepository.findOneBy({ categoryId });
    if (!category) {
      throw new HttpException(
        `Category with ID ${categoryId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (parentId) {
      const parentCategory = await this.categoryRepository.findOneBy({
        categoryId: parentId,
      });
      if (!parentCategory) {
        throw new HttpException(
          `Parent category with ID ${parentId} not found`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    Object.assign(category, updateCategoryDto);
    const updatedCategory = await this.categoryRepository.save({
      categoryId: categoryId,
      ...data,
      parentId: parentId || null,
    });
    const categories = await this.categoryRepository.find();
    return this.toResponseDto(updatedCategory, categories);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const category = await this.categoryRepository.findOneBy({ categoryId });
    if (!category) {
      throw new HttpException(
        `Category with ID ${categoryId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const childCategories = await this.categoryRepository.find({
      where: { parentId: categoryId },
    });

    const newParentId = category.parentId || null;
    for (const child of childCategories) {
      child.parentId = newParentId;
      await this.categoryRepository.save(child);
    }

    await this.categoryRepository.remove(category);
  }
}
