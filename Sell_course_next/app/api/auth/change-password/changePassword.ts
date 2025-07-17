import {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "@/app/types/auth/change-password/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const changePasswordAPI = async (
  data: ChangePasswordRequest,
  token: string
): Promise<ChangePasswordResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/api/users/user/change-password`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
};
