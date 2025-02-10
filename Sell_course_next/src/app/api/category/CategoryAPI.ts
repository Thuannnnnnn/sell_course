import { Category } from "@/app/type/category/Category";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await axios.get<Category[]>(
      `${API_BASE_URL}/admin/categories/view_category`
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

export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    await axios.delete<Category[]>(
      `${API_BASE_URL}admin/categories/delete_category/` + categoryId
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
export const addCategory = async (category: Category): Promise<Category> => {
  try {
    const payload = {
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      children: category.children || [],
    };

    const response = await axios.post(
      `${API_BASE_URL}/admin/categories/create_category`,
      payload
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateCategory = async (category: Category): Promise<Category> => {
  try {
    const payload = {
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      children: category.children || [],
    };

    const response = await axios.put(
      `${API_BASE_URL}/admin/categories/update_category/${category.categoryId}`,
      payload
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
