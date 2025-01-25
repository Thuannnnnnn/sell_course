import { Category } from "@/app/type/category/Category";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/categories";

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await axios.get<Category[]>(`${API_BASE_URL}/getAll`);
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
    await axios.delete<Category[]>(`${API_BASE_URL}/deleteCategory/` + categoryId);
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
