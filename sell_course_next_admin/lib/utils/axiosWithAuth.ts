import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { refreshAccessToken } from './refreshToken';

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

export function createAxiosWithAuth(): AxiosInstance {
  const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
  });

  // Request interceptor to add auth token
  axiosInstance.interceptors.request.use(
    async (config) => {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token refresh
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error) => {
      const originalRequest: CustomAxiosRequestConfig = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const session = await getSession();
          
          if (session?.refreshToken) {
            const refreshedTokens = await refreshAccessToken(session.refreshToken);
            
            if (refreshedTokens) {
              // Update the session with new tokens
              // Note: This is a simplified approach. In a real application,
              // you might need to update the session more appropriately
              
              // Retry the original request with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${refreshedTokens.token}`;
              }
              
              return axiosInstance(originalRequest);
            } else {
              // Refresh failed, sign out user
              await signOut({ callbackUrl: '/auth/login' });
              return Promise.reject(error);
            }
          } else {
            // No refresh token, sign out user
            await signOut({ callbackUrl: '/auth/login' });
            return Promise.reject(error);
          }
        } catch (refreshError) {
          // Refresh failed, sign out user
          console.error('Token refresh failed:', refreshError);
          await signOut({ callbackUrl: '/auth/login' });
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
}

// Create a singleton instance
export const apiClient = createAxiosWithAuth();
