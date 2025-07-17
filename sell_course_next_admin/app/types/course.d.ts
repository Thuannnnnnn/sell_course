export interface Course {
  courseId: string;
  title: string;
  category: string;
  thumbnail: string;
  short_description: string;
  description: string;
  price: number;
  status: "Published" | "Draft" | "Pending" | "Processing" | "Rejected";
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
