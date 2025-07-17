// wishlist-api.ts
import { ApiError } from '../../api/courses/courses';
import {
  WishlistRequestDto,
  WishlistResponseDto,
} from "@/app/types/profile/wishlist/wishlist";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        typeof data === "object" && data.message
          ? data.message
          : "An error occurred";
      throw new ApiError(errorMessage, response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Network error or server unavailable", 0);
  }
}

export const wishlistApi = {
  // Add course to wishlist
  addToWishlist: async (
    dto: WishlistRequestDto,
    token: string
  ): Promise<WishlistResponseDto> => {
    return apiCall<WishlistResponseDto>("/api/wishlist/add", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    });
  },

  // Get user's wishlist
  getWishlist: async (
    userId: string,
    token: string
  ): Promise<WishlistResponseDto[]> => {
    return apiCall<WishlistResponseDto[]>(`/api/wishlist/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Remove from wishlist
  removeFromWishlist: async (
    courseId: string,
    token: string
  ): Promise<string> => {
    return apiCall<string>(`/api/wishlist/${courseId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export default wishlistApi;