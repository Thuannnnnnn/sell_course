import { Category } from '../../types/category';
import axios from 'axios';

export const fetchCategories = async (token: string): Promise<Category[]> => {
  try {
    const response = await axios.get<Category[]>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories/view_category`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        'Axios error fetching categories:',
        error.response?.data || error.message
      );
    } else {
      console.error('Unexpected error fetching categories:', error);
    }
    throw error;
  }
};

export const deleteCategory = async (
  categoryId: string,
  token: string
): Promise<void> => {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories/delete_category/${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      
      if (error.response?.status === 404) {
        throw new Error('Category not found.');
      }
      
      if (error.response?.status === 500) {
        if (errorData?.message?.includes('courses')) {
          throw new Error('Cannot delete this category because it is being used by one or more courses.');
        } else if (errorData?.message?.includes('children')) {
          throw new Error('Cannot delete this category because it has child categories. Please delete child categories first.');
        }
      }
      
      throw new Error(errorData?.message || 'Failed to delete category. Please try again later.');
    }
    throw new Error('An unexpected error occurred. Please try again later.');
  }
};

export const addCategory = async (
  category: Category,
  token: string
): Promise<Category> => {
  try {
    const payload = {
      name: category.name,
      description: category.description,
      parentId: category.parentId,
    };
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories/create_category`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      
      if (error.response?.status === 400) {
        if (errorData?.message?.includes('parent')) {
          throw new Error('Parent category does not exist.');
        }
        throw new Error('Invalid data. Please check your information.');
      }
      
      throw new Error(errorData?.message || 'Failed to create category. Please try again later.');
    }
    throw new Error('An unexpected error occurred. Please try again later.');
  }
};

export const updateCategory = async (
  category: Category,
  token: string
): Promise<Category> => {
  try {
    const payload = {
      name: category.name,
      description: category.description,
      parentId: category.parentId,
    };

    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories/update_category/${category.categoryId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      
      if (error.response?.status === 404) {
        throw new Error('Category not found.');
      }
      
      if (error.response?.status === 400) {
        if (errorData?.message?.includes('parent')) {
          throw new Error('Parent category does not exist.');
        }
        throw new Error('Invalid data. Please check your information.');
      }
      
      throw new Error(errorData?.message || 'Failed to update category. Please try again later.');
    }
    throw new Error('An unexpected error occurred. Please try again later.');
  }
};