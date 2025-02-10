import { Category } from "@/app/type/category/Category";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export const fetchCategories = async (token: string): Promise<Category[]> => {
  try {
    const response = await axios.get<Category[]>(
      `${API_BASE_URL}/admin/categories/view_category`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("data:" + JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error fetching categories:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error fetching categories:", error);
    }
    throw error;
  }
};

export const deleteCategory = async (
  categoryId: string,
  token: string
): Promise<void> => {
  try {
    await axios.delete<Category[]>(
      `${API_BASE_URL}/admin/categories/delete_category/` + categoryId,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error fetching categories:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error fetching categories:", error);
    }
    throw error;
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
      children: category.children || [],
    };

    const response = await axios.post(
      `${API_BASE_URL}/admin/categories/create_category`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
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
      children: category.children || [],
    };

    const response = await axios.put(
      `${API_BASE_URL}/admin/categories/update_category/${category.categoryId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
