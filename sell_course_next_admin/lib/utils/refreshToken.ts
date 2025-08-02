import axios from 'axios';

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  user_id: string;
  email: string;
  username: string;
  avatarImg?: string;
  gender?: string;
  birthDay?: string;
  phoneNumber?: string;
  role?: string;
}

export async function refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse | null> {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
      {
        refreshToken
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (response.status === 200) {
      return response.data;
    }

    return null;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
}

export function isTokenExpired(expiresAt: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  // Check if token expires in the next 5 minutes
  const buffer = 5 * 60; // 5 minutes in seconds
  return (expiresAt - buffer) <= now;
}
