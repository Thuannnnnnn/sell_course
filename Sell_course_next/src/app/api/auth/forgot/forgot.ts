import axios from 'axios';

interface ApiResponse {
  statusCode: number;
  message: string;
}

export async function sendMail(
  email: string,
  lang: string
): Promise<ApiResponse | false> {
  try {
    const response = await axios.post<ApiResponse>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/forgot-verify-email`,
      {
        email: email,
        lang: lang,
      }
    );

    return response.data;
  } catch {
    return false;
  }
}

export async function resetPassword(
  email: string,
  password: string,
  token: string
): Promise<ApiResponse | false> {
  try {
    if (!email) {
      console.warn('Email is missing from URL, requesting user input');
      throw new Error('Email is required for password reset');
    }
    const response = await axios.post<ApiResponse>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/reset-password`,
      {
        email: email,
        password: password,
        token: token,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Reset password failed. Error details:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios Error Response:', error.response?.data);
      throw new Error(
        `Failed API: ${error.response?.data?.message || 'Unknown API error'}`
      );
    } else {
      throw new Error('Unexpected error: ' + (error instanceof Error ? error.message : 'Unknown'));
    }
  }
}
