import { Category } from "@/app/type/category/Category";
import axios from "axios";
export const fetchCategories = async (token: string): Promise<Category[]> => {
  try {
    const response = await axios.get<Category[]>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/categories/view_category`,
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
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/categories/delete_category/` +
        categoryId,
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
    console.log(token);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/categories/create_category`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
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
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/categories/update_category/${category.categoryId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
