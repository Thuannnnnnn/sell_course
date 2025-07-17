import { Promotion, CreatePromotionDto, UpdatePromotionDto } from '../../types/promotion';
import axios from 'axios';

export const fetchPromotions = async (token: string): Promise<Promotion[]> => {
  try {
    const response = await axios.get<Promotion[]>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/promotion/show_promotion`,
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
        'Axios error fetching promotions:',
        error.response?.data || error.message
      );
    } else {
      console.error('Unexpected error fetching promotions:', error);
    }
    throw error;
  }
};

export const createPromotion = async (
  promotion: CreatePromotionDto,
  token: string
): Promise<Promotion> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/promotion/create_promotion`,
      promotion,
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
        throw new Error('Invalid data. Please check your information.');
      }
      
      throw new Error(errorData?.message || 'Failed to create promotion. Please try again later.');
    }
    throw new Error('An unexpected error occurred. Please try again later.');
  }
};

export const updatePromotion = async (
  id: string,
  promotion: UpdatePromotionDto,
  token: string
): Promise<Promotion> => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/promotion/update_promotion/${id}`,
      promotion,
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
        throw new Error('Promotion not found.');
      }
      
      if (error.response?.status === 400) {
        throw new Error('Invalid data. Please check your information.');
      }
      
      throw new Error(errorData?.message || 'Failed to update promotion. Please try again later.');
    }
    throw new Error('An unexpected error occurred. Please try again later.');
  }
};

export const deletePromotion = async (
  id: string,
  token: string
): Promise<void> => {
  try {
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/promotion/delete_promotion/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      
      if (error.response?.status === 404) {
        throw new Error('Promotion not found.');
      }
      
      throw new Error(errorData?.message || 'Failed to delete promotion. Please try again later.');
    }
    throw new Error('An unexpected error occurred. Please try again later.');
  }
}; 