import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { HttpException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

describe('CategoryService', () => {
  let service: CategoryService;

  const mockCategoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };

  const mockCategory = {
    categoryId: uuidv4(),
    name: 'Test Category',
    description: 'Test Description',
    parentId: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    // Removed unused categoryRepository variable
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const createCategoryDto = {
        name: 'Test Category',
        description: 'Test Description',
        parentId: null,
      };
      mockCategoryRepository.create.mockReturnValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(mockCategory);
      mockCategoryRepository.find.mockResolvedValue([mockCategory]);

      const result = await service.createCategory(createCategoryDto);

      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        categoryId: expect.any(String),
        name: 'Test Category',
        description: 'Test Description',
        parentId: null,
      });
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(mockCategory);
      expect(result).toEqual({
        categoryId: mockCategory.categoryId,
        name: mockCategory.name,
        description: mockCategory.description,
        parentId: mockCategory.parentId,
        children: [],
      });
    });

    it('should throw an error if parent category is not found', async () => {
      const createCategoryDto = {
        name: 'Test Category',
        description: 'Test Description',
        parentId: 'invalid-id',
      };
      mockCategoryRepository.findOneBy.mockResolvedValue(null);

      await expect(service.createCategory(createCategoryDto)).rejects.toThrow(
        new HttpException('Parent category with ID invalid-id not found', 404),
      );
    });
  });

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      mockCategoryRepository.find.mockResolvedValue([mockCategory]);

      const result = await service.getAllCategories();

      expect(mockCategoryRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('getCategoryById', () => {
    it('should return a category by ID', async () => {
      mockCategoryRepository.find.mockResolvedValue([mockCategory]);

      const result = await service.getCategoryById(mockCategory.categoryId);

      expect(mockCategoryRepository.find).toHaveBeenCalled();
      expect(result).toEqual({
        categoryId: mockCategory.categoryId,
        name: mockCategory.name,
        description: mockCategory.description,
        parentId: mockCategory.parentId,
        children: [],
      });
    });

    it('should throw an error if category is not found', async () => {
      mockCategoryRepository.find.mockResolvedValue([]);

      await expect(service.getCategoryById('invalid-id')).rejects.toThrow(
        new HttpException('Category with ID invalid-id not found', 404),
      );
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const updateCategoryDto = {
        name: 'Updated Category',
        description: 'Updated Description',
        parentId: null,
      };
      mockCategoryRepository.findOneBy.mockResolvedValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue({
        ...mockCategory,
        ...updateCategoryDto,
      });
      mockCategoryRepository.find.mockResolvedValue([
        { ...mockCategory, ...updateCategoryDto },
      ]);

      const result = await service.updateCategory(
        mockCategory.categoryId,
        updateCategoryDto,
      );

      expect(mockCategoryRepository.save).toHaveBeenCalledWith({
        categoryId: mockCategory.categoryId,
        ...updateCategoryDto,
      });
      expect(result).toEqual({
        categoryId: mockCategory.categoryId,
        name: 'Updated Category',
        description: 'Updated Description',
        parentId: null,
        children: [],
      });
    });

    it('should throw an error if category is not found', async () => {
      mockCategoryRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.updateCategory('invalid-id', {
          name: '',
          description: '',
          parentId: null,
        }),
      ).rejects.toThrow(
        new HttpException('Category with ID invalid-id not found', 404),
      );
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      mockCategoryRepository.findOneBy.mockResolvedValue(mockCategory);
      mockCategoryRepository.find.mockResolvedValue([]);
      mockCategoryRepository.remove.mockResolvedValue(undefined);

      await service.deleteCategory(mockCategory.categoryId);

      expect(mockCategoryRepository.remove).toHaveBeenCalledWith(mockCategory);
    });

    it('should throw an error if category is not found', async () => {
      mockCategoryRepository.findOneBy.mockResolvedValue(null);

      await expect(service.deleteCategory('invalid-id')).rejects.toThrow(
        new HttpException('Category with ID invalid-id not found', 404),
      );
    });
  });
});
