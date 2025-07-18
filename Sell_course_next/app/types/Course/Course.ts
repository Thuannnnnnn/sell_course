export enum CourseStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  REJECTED = 'REJECTED'
}

export interface Course {
  courseId: string;
  title: string;
  description: string;
  short_description: string;
  duration: number;
  price: number;
  videoIntro: string | null;
  thumbnail: string;
  rating: number;
  skill: string;
  level: string;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  categoryId: string;
  categoryName: string;
}

export interface CourseRequestDTO {
  instructorId: string;
  categoryId: string;
  title: string;
  description: string;
  short_description: string;
  duration: number;
  price: number;
  skill: string;
  level: string;
  status?: CourseStatus;
}

export interface CourseResponseDTO {
  courseId: string;
  title: string;
  description: string;
  short_description: string;
  duration: number;
  price: number;
  videoIntro: string | null;
  thumbnail: string;
  rating: number;
  skill: string;
  level: string;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  categoryId: string;
  categoryName: string;
}

// For the CourseCard component compatibility
export interface CourseCardData {
  id: string;
  title: string;
  instructor: string;
  price: string;
  rating: number;
  image: string;
  description?: string;
  level?: string;
  duration?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface CoursesApiResponse extends ApiResponse<CourseResponseDTO[]> {
  data: CourseResponseDTO[];
}
