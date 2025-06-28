export interface Enrollment {
  enrollmentId: number;
  user: {
    user_id: string;
    name: string;
    email: string;
  };
  course: {
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
    status: boolean;
    instructorName: string;
  };
  status: string;
  enroll_at: string;
}

export interface EnrollmentRequest {
  enrollmentId: number;
  userId: string;
  courseId: string;
  status: string;
}

export interface EnrollmentResponse {
  enrolled: boolean;
} 