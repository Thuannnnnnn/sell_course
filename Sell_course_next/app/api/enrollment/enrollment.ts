import { ApiError } from '../courses/courses';
import { Enrollment, EnrollmentRequest, EnrollmentResponse } from '@/app/types/enrollment/enrollment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

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

    // Check if response is JSON
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

// Server-side enrollment check function
export async function checkEnrollmentServer(courseId: string): Promise<EnrollmentResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      throw new ApiError('Unauthorized', 401);
    }

    if (!courseId) {
      throw new ApiError('Course ID is required', 400);
    }

    // Call your NestJS backend to check enrollment
    const response = await fetch(`${API_BASE_URL}/api/enrollment/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        courseId: courseId,
        userId: session.user.id
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to check enrollment');
    }

    const data = await response.json();
    
    return {
      enrolled: data.enrolled || false
    };

  } catch (error) {
    console.error('Error checking enrollment:', error);
    throw new ApiError('Failed to check enrollment status', 500);
  }
}

// Client-side enrollment API functions
export const enrollmentApi = {
  // Check if user is enrolled in a course (client-side)
  checkEnrollment: async (courseId: string): Promise<EnrollmentResponse> => {
    return apiCall<EnrollmentResponse>(`/api/enrollment/check?courseId=${courseId}`);
  },

  // Get user's enrolled courses
  getUserEnrollments: async (): Promise<Enrollment[]> => {
    return apiCall<Enrollment[]>("/api/enrollment/user");
  },

  // Create enrollment
  createEnrollment: async (enrollmentData: EnrollmentRequest): Promise<Enrollment> => {
    return apiCall<Enrollment>("/api/enrollment", {
      method: "POST",
      body: JSON.stringify(enrollmentData),
    });
  },

  // Update enrollment status
  updateEnrollmentStatus: async (
    enrollmentId: number,
    status: string
  ): Promise<Enrollment> => {
    return apiCall<Enrollment>(`/api/enrollment/${enrollmentId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  // Delete enrollment
  deleteEnrollment: async (enrollmentId: number): Promise<void> => {
    return apiCall<void>(`/api/enrollment/${enrollmentId}`, {
      method: "DELETE",
    });
  },
};

export default enrollmentApi; 