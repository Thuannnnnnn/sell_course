import axios from "axios";
import {
  Certificate,
  CertificateVerificationRequest,
  CertificateVerificationResponse,
  CreateCertificateDto,
  RevokeCertificateDto,
} from "../../../types/certificate";
import { findCertificateById } from "./mockData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Certificate API functions
export const certificateApi = {
  // Verify certificate (public endpoint - no auth required)
  verifyCertificate: async (
    certificateId: string
  ): Promise<CertificateVerificationResponse> => {
    try {
      console.log("🔍 Verifying certificate:", certificateId);
      
      // Check if backend is available, if not fall back to mock data
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      
      try {
        // Try to call real backend API first
        console.log("🌐 Calling backend API:", `${backendUrl}/api/public/certificate/verify`);
        
        const response = await apiClient.post<CertificateVerificationResponse>(
          "/api/public/certificate/verify",
          { certificateId } as CertificateVerificationRequest
        );
        
        console.log("✅ Backend API response:", response.data);
        return response.data;
        
      } catch (backendError) {
        console.warn("⚠️ Backend API failed, falling back to mock data:", backendError);
        
        // Fallback to mock data if backend is not available
        console.log("🧪 Using mock data for certificate verification");
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockCertificate = findCertificateById(certificateId);
        
        if (mockCertificate) {
          return {
            success: true,
            certificate: mockCertificate
          };
        } else {
          return {
            success: false,
            error: "Certificate not found. Please check the certificate ID and try again."
          };
        }
      }
      
    } catch (error) {
      console.error("❌ Failed to verify certificate:", error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return {
            success: false,
            error: "Certificate not found. Please check the certificate ID and try again.",
          };
        }
        if (error.response?.status === 400) {
          return {
            success: false,
            error: "Invalid certificate ID format.",
          };
        }
      }
      
      return {
        success: false,
        error: "An error occurred while verifying the certificate. Please try again.",
      };
    }
  },

  // Create certificate (requires authentication)
  createCertificate: async (
    certificateData: CreateCertificateDto,
    token: string
  ): Promise<Certificate> => {
    try {
      console.log("🏆 Creating certificate:", certificateData);
      
      const response = await apiClient.post<Certificate>(
        "/api/admin/certificate/create",
        certificateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("✅ Certificate created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to create certificate:", error);
      throw error;
    }
  },

  // Get certificate by ID (requires authentication)
  getCertificateById: async (
    certificateId: string,
    token: string
  ): Promise<Certificate> => {
    try {
      console.log("📋 Getting certificate by ID:", certificateId);
      
      const response = await apiClient.get<Certificate>(
        `/api/admin/certificate/${certificateId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("✅ Certificate retrieved successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to get certificate:", error);
      throw error;
    }
  },

  // Get user's certificates (requires authentication)
  getUserCertificates: async (token: string): Promise<Certificate[]> => {
    try {
      console.log("📜 Getting user certificates");
      
      const response = await apiClient.get<Certificate[]>(
        "/api/user/certificates",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("✅ User certificates retrieved:", response.data.length, "certificates");
      return response.data;
    } catch (error) {
      console.error("❌ Failed to get user certificates:", error);
      throw error;
    }
  },

  // Get certificates for a course (requires authentication)
  getCourseCertificates: async (
    courseId: string,
    token: string
  ): Promise<Certificate[]> => {
    try {
      console.log("📚 Getting certificates for course:", courseId);
      
      const response = await apiClient.get<Certificate[]>(
        `/api/admin/certificate/course/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("✅ Course certificates retrieved:", response.data.length, "certificates");
      return response.data;
    } catch (error) {
      console.error("❌ Failed to get course certificates:", error);
      throw error;
    }
  },

  // Revoke certificate (requires authentication)
  revokeCertificate: async (
    revokeData: RevokeCertificateDto,
    token: string
  ): Promise<{ message: string }> => {
    try {
      console.log("🚫 Revoking certificate:", revokeData);
      
      const response = await apiClient.post<{ message: string }>(
        "/api/admin/certificate/revoke",
        revokeData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("✅ Certificate revoked successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to revoke certificate:", error);
      throw error;
    }
  },

  // Download certificate PDF (requires authentication)
  downloadCertificate: async (
    certificateId: string,
    token: string
  ): Promise<Blob> => {
    try {
      console.log("⬇️ Downloading certificate:", certificateId);
      
      const response = await apiClient.get(
        `/api/user/certificate/${certificateId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );
      
      console.log("✅ Certificate downloaded successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Failed to download certificate:", error);
      throw error;
    }
  },
};

export default certificateApi;
