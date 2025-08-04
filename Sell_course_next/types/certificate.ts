export interface Certificate {
  certificateId: string;
  courseId: string;
  userId: string;
  courseName: string;
  studentName: string;
  studentEmail: string;
  instructorName: string;
  issueDate: string;
  completionDate: string;
  score?: number;
  grade?: string;
  isValid: boolean;
  isRevoked: boolean;
  verificationHash: string;
  metadata?: {
    duration?: string;
    requirements?: string[];
    skills?: string[];
  };
}

export interface CertificateVerificationRequest {
  certificateId: string;
}

export interface CertificateVerificationResponse {
  success: boolean;
  certificate?: Certificate;
  error?: string;
}

export interface CreateCertificateDto {
  courseId: string;
  userId: string;
  score?: number;
  grade?: string;
  completionDate?: string;
}

export interface RevokeCertificateDto {
  certificateId: string;
  reason: string;
}
