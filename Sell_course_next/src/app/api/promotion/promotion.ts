import { Course } from "@/app/type/course/Course";
import axios from "axios";

export interface Promotion {
  id: string;
  name: string;
  discount: number;
  code: string;
  course: Course;
}
export interface PromotionData {
  name: string;
  discount: number;
  code: string;
  courseId: string;
}

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;

export const createPromotion = async (
  promotionData: PromotionData,
  token: string
) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/admin/promotion/create_promotion`,
      promotionData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating promotion:", error);
    throw error;
  }
};

export const getAllPromotions = async (token: string) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/admin/promotion/show_promotion`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching promotions:", error);
    throw error;
  }
};
export const getPromotionByCode = async (code: string, token: string) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/promotion/show_promotion_code/${code}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching promotion by code:", error);
    throw error;
  }
};
export const updatePromotion = async (
  id: string,
  promotionData: PromotionData,
  token: string
) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/admin/promotion/update_promotion/${id}`,
      promotionData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating promotion:", error);
    throw error;
  }
};

// Delete a promotion
export const deletePromotion = async (id: string, token: string) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/admin/promotion/delete_promotion/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting promotion:", error);
    throw error;
  }
};
