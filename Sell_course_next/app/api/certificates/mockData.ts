import { Certificate } from "../../../types/certificate";

// Mock certificate database
export const mockCertificates: Certificate[] = [
  {
    certificateId: "CERT-123456",
    courseId: "course-react-advanced",
    userId: "user-john-doe",
    courseName: "Advanced React Development",
    studentName: "John Doe",
    studentEmail: "john.doe@example.com",
    instructorName: "Jane Smith",
    issueDate: "2024-03-15T10:30:00Z",
    completionDate: "2024-03-15T09:45:00Z",
    score: 95,
    grade: "A",
    isValid: true,
    isRevoked: false,
    verificationHash: "sha256:abc123def456ghi789",
    metadata: {
      duration: "40 hours",
      requirements: ["Complete all modules", "Pass final exam with 80%+", "Submit final project"],
      skills: ["React Hooks", "Redux", "TypeScript", "Testing"]
    }
  },
  {
    certificateId: "CERT-789012",
    courseId: "course-nodejs-basics",
    userId: "user-jane-smith",
    courseName: "Node.js Fundamentals",
    studentName: "Jane Smith",
    studentEmail: "jane.smith@example.com",
    instructorName: "Bob Johnson",
    issueDate: "2024-02-20T14:15:00Z",
    completionDate: "2024-02-20T13:30:00Z",
    score: 87,
    grade: "B+",
    isValid: true,
    isRevoked: false,
    verificationHash: "sha256:xyz789abc123def456",
    metadata: {
      duration: "25 hours",
      requirements: ["Complete all modules", "Pass quizzes", "Build a REST API"],
      skills: ["Express.js", "MongoDB", "REST APIs", "Authentication"]
    }
  },
  {
    certificateId: "CERT-345678",
    courseId: "course-python-web",
    userId: "user-mike-wilson",
    courseName: "Python Web Development",
    studentName: "Mike Wilson",
    studentEmail: "mike.wilson@example.com",
    instructorName: "Sarah Davis",
    issueDate: "2023-12-10T16:45:00Z",
    completionDate: "2023-12-10T15:20:00Z",
    score: 92,
    grade: "A-",
    isValid: false,
    isRevoked: true,
    verificationHash: "sha256:revoked123456789",
    metadata: {
      duration: "35 hours",
      requirements: ["Complete all modules", "Deploy web application", "Code review"],
      skills: ["Django", "PostgreSQL", "Docker", "AWS Deployment"]
    }
  }
];

export const findCertificateById = (certificateId: string): Certificate | null => {
  return mockCertificates.find(cert => cert.certificateId === certificateId) || null;
};
