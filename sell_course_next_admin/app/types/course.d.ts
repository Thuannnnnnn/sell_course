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
  category: string;
  thumbnail: string;
  short_description: string;
  description: string;
  price: number;
  status: CourseStatus;
  updatedAt: string;
  duration: number;
  skill: "Beginner" | "Intermediate" | "Advanced";
  createdAt: string;
  level: string;
  instructorId: string;
  instructorName: string;
  categoryId: string;
  categoryName: string;
}
