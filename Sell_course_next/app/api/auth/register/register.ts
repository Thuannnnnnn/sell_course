import { ApiResponse, RegisterData } from "@/app/types/auth/Register/api";
import { UserResponse } from "@/app/types/user";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "ApiError";
  }
}

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
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.message || "An error occurred", response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError("Network error or server unavailable", 0);
  }
}

// Auth API functions
export const authApi = {
  // Send OTP for email verification
  sendVerificationOtp: async (
    email: string,
    lang: string = "en"
  ): Promise<ApiResponse> => {
    return apiCall<ApiResponse>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, lang }),
    });
  },

  // Verify OTP for registration
  verifyOtp: async (
    email: string,
    otp_code: string
  ): Promise<ApiResponse & { verified: boolean }> => {
    return apiCall<ApiResponse & { verified: boolean }>(
      "/api/auth/verify-otp",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          otp_code,
          purpose: "email_verification",
        }),
      }
    );
  },

  // Register with OTP
  registerWithOtp: async (userData: RegisterData): Promise<UserResponse> => {
    return apiCall<UserResponse>("/api/auth/register-with-otp", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Resend OTP
  resendOtp: async (
    email: string,
    lang: string = "en"
  ): Promise<ApiResponse> => {
    return apiCall<ApiResponse>("/api/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({
        email,
        purpose: "email_verification",
        lang,
      }),
    });
  },
};

export default authApi;
