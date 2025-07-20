import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Certificate types
export interface Certificate {
  certificateId: string;
  title: string;
  createdAt: string;
  course: {
    courseId: string;
    title: string;
  };
  user: {
    user_id: string;
    username: string;
    email: string;
  };
}

export interface CreateCertificateRequest {
  title: string;
  courseId: string;
  userId: string;
}

export interface UpdateCertificateRequest {
  title?: string;
  courseId?: string;
  userId?: string;
}

export interface CertificateVerificationResponse {
  isValid: boolean;
  certificate?: Certificate;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// Create a new certificate
export const createCertificate = async (
  token: string,
  certificateData: CreateCertificateRequest
): Promise<Certificate> => {
  try {
    console.log("Creating certificate with data:", certificateData);

    const response = await axios.post<ApiResponse<Certificate>>(
      `${API_URL}/api/certificates`,
      certificateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Certificate created successfully:", response.data.data);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Certificate creation error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });

      if (error.response?.status === 401) {
        throw new Error(
          "Authentication failed: Your session may have expired. Please log in again."
        );
      }

      if (error.response?.status === 400) {
        throw new Error(
          `Invalid certificate data: ${
            error.response?.data?.message || "Please check your input"
          }`
        );
      }
    }

    console.error("Certificate creation error:", error);
    throw new Error(
      `Failed to create certificate: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Get all certificates
export const getAllCertificates = async (
  token: string
): Promise<Certificate[]> => {
  try {
    console.log("Fetching all certificates");

    const response = await axios.get<ApiResponse<Certificate[]>>(
      `${API_URL}/api/certificates`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Certificates fetched successfully:", response.data.data.length);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Get certificates error:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.response?.status === 401) {
        throw new Error(
          "Authentication failed: Your session may have expired. Please log in again."
        );
      }
    }

    console.error("Get certificates error:", error);
    throw new Error(
      `Failed to fetch certificates: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Get certificates by user ID
export const getCertificatesByUserId = async (
  token: string,
  userId: string
): Promise<Certificate[]> => {
  try {
    console.log("Fetching certificates for user:", userId);

    const response = await axios.get<ApiResponse<Certificate[]>>(
      `${API_URL}/api/certificates/user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(
      "User certificates fetched successfully:",
      response.data.data.length
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Get user certificates error:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.response?.status === 401) {
        throw new Error(
          "Authentication failed: Your session may have expired. Please log in again."
        );
      }

      if (error.response?.status === 404) {
        console.log("No certificates found for user:", userId);
        return []; // Return empty array instead of throwing error
      }
    }

    console.error("Get user certificates error:", error);
    throw new Error(
      `Failed to fetch user certificates: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Get certificate by ID
export const getCertificateById = async (
  token: string,
  certificateId: string
): Promise<Certificate> => {
  try {
    console.log("Fetching certificate by ID:", certificateId);

    const response = await axios.get<ApiResponse<Certificate>>(
      `${API_URL}/api/certificates/${certificateId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Certificate fetched successfully:", response.data.data);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Get certificate by ID error:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.response?.status === 401) {
        throw new Error(
          "Authentication failed: Your session may have expired. Please log in again."
        );
      }

      if (error.response?.status === 404) {
        throw new Error(`Certificate with ID ${certificateId} not found`);
      }
    }

    console.error("Get certificate by ID error:", error);
    throw new Error(
      `Failed to fetch certificate: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Update certificate
export const updateCertificate = async (
  token: string,
  certificateId: string,
  updateData: UpdateCertificateRequest
): Promise<Certificate> => {
  try {
    console.log("Updating certificate:", certificateId, updateData);

    const response = await axios.patch<ApiResponse<Certificate>>(
      `${API_URL}/api/certificates/${certificateId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Certificate updated successfully:", response.data.data);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Update certificate error:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.response?.status === 401) {
        throw new Error(
          "Authentication failed: Your session may have expired. Please log in again."
        );
      }

      if (error.response?.status === 404) {
        throw new Error(`Certificate with ID ${certificateId} not found`);
      }

      if (error.response?.status === 400) {
        throw new Error(
          `Invalid update data: ${
            error.response?.data?.message || "Please check your input"
          }`
        );
      }
    }

    console.error("Update certificate error:", error);
    throw new Error(
      `Failed to update certificate: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Delete certificate
export const deleteCertificate = async (
  token: string,
  certificateId: string
): Promise<string> => {
  try {
    console.log("Deleting certificate:", certificateId);

    const response = await axios.delete<ApiResponse<void>>(
      `${API_URL}/api/certificates/${certificateId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Certificate deleted successfully");
    return response.data.message || "Certificate deleted successfully";
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Delete certificate error:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.response?.status === 401) {
        throw new Error(
          "Authentication failed: Your session may have expired. Please log in again."
        );
      }

      if (error.response?.status === 404) {
        throw new Error(`Certificate with ID ${certificateId} not found`);
      }
    }

    console.error("Delete certificate error:", error);
    throw new Error(
      `Failed to delete certificate: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Verify certificate (public endpoint - no token required)
export const verifyCertificate = async (
  certificateId: string,
  token?: string
): Promise<boolean> => {
  try {
    console.log("Verifying certificate:", certificateId);

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get<ApiResponse<boolean>>(
      `${API_URL}/api/certificates/${certificateId}/verify`,
      { headers }
    );

    console.log("Certificate verification result:", response.data.data);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Certificate verification error:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.response?.status === 404) {
        console.log("Certificate not found or invalid:", certificateId);
        return false; // Return false instead of throwing error for verification
      }
    }

    console.error("Certificate verification error:", error);
    throw new Error(
      `Failed to verify certificate: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Get certificate XML data (API endpoint)
export const getCertificateXML = async (
  certificateId: string,
  token?: string
): Promise<string> => {
  try {
    console.log("Fetching certificate XML:", certificateId);

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Use the static XML endpoint (public access)
    const response = await axios.get<string>(
      `${API_URL}/certificates/${certificateId}.xml`,
      {
        headers,
        responseType: "text",
      }
    );

    console.log("Certificate XML fetched successfully");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Get certificate XML error:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.response?.status === 404) {
        throw new Error(
          `Certificate XML for ID ${certificateId} not found or not yet generated`
        );
      }
    }

    console.error("Get certificate XML error:", error);
    throw new Error(
      `Failed to fetch certificate XML: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// FIXED: Download certificate PDF
export const downloadCertificatePDF = async (
  certificateId: string,
  filename?: string
): Promise<void> => {
  try {
    console.log("Downloading certificate PDF:", certificateId);

    // Direct download from static endpoint (no auth required)
    const response = await axios.get(
      `${API_URL}/certificates/${certificateId}/download/pdf`,
      {
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `certificate-${certificateId}.pdf`;
    document.body.appendChild(link);
    link.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    console.log("Certificate PDF downloaded successfully");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Download certificate PDF error:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.response?.status === 404) {
        throw new Error(`Certificate PDF for ID ${certificateId} not found`);
      }
    }

    console.error("Download certificate PDF error:", error);
    throw new Error(
      `Failed to download certificate PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// FIXED: Download certificate XML
export const downloadCertificateXML = async (
  certificateId: string,
  filename?: string
): Promise<void> => {
  try {
    console.log("Downloading certificate XML:", certificateId);

    // Use the direct XML endpoint (public access, no auth required)
    const response = await axios.get(
      `${API_URL}/certificates/${certificateId}.xml`,
      {
        responseType: "blob",
      }
    );
    
    const blob = new Blob([response.data], { type: "application/xml" });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `certificate-${certificateId}.xml`;
    document.body.appendChild(link);
    link.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    console.log("Certificate XML downloaded successfully");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Download certificate XML error:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.response?.status === 404) {
        throw new Error(`Certificate XML for ID ${certificateId} not found or not yet generated`);
      }
    }

    console.error("Download certificate XML error:", error);
    throw new Error(
      `Failed to download certificate XML: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Get certificate display URL (for viewing the beautiful HTML certificate)
export const getCertificateDisplayUrl = (certificateId: string): string => {
  return `${API_URL}/certificates/${certificateId}`;
};

// Get certificate XML URL (for raw XML data)
export const getCertificateXMLUrl = (certificateId: string): string => {
  return `${API_URL}/certificates/${certificateId}.xml`;
};

// Get certificate PDF download URL
export const getCertificatePDFUrl = (certificateId: string): string => {
  return `${API_URL}/certificates/${certificateId}/download/pdf`;
};

// Get certificate XML download URL
export const getCertificateXMLDownloadUrl = (certificateId: string): string => {
  return `${API_URL}/certificates/${certificateId}/download/xml`;
};

// Open certificate in new tab (displays the beautiful HTML version)
export const openCertificateInNewTab = (certificateId: string): void => {
  const url = getCertificateDisplayUrl(certificateId);
  window.open(url, "_blank");
};

// Preview certificate in new tab (same as openCertificateInNewTab but more descriptive)
export const previewCertificate = (certificateId: string): void => {
  openCertificateInNewTab(certificateId);
};

// Share certificate (returns the public URL)
export const shareCertificate = (certificateId: string): string => {
  return getCertificateDisplayUrl(certificateId);
};

// Copy certificate URL to clipboard
export const copyCertificateUrl = async (certificateId: string): Promise<void> => {
  const url = getCertificateDisplayUrl(certificateId);
  
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }
    console.log("Certificate URL copied to clipboard");
  } catch (error) {
    console.error("Failed to copy URL to clipboard:", error);
    throw new Error("Failed to copy URL to clipboard");
  }
};

// Utility function to check if a certificate ID is valid format
export const isValidCertificateId = (certificateId: string): boolean => {
  // Add your certificate ID validation logic here
  // For now, just check if it's not empty and has reasonable length
  return Boolean(certificateId) && certificateId.trim().length > 0 && certificateId.length <= 100;
};

// Get certificate status/info without full data (lightweight check)
export const getCertificateStatus = async (
  certificateId: string
): Promise<{ exists: boolean; isValid: boolean }> => {
  try {
    const isValid = await verifyCertificate(certificateId);
    return {
      exists: isValid,
      isValid: isValid,
    };
  } catch {
    return {
      exists: false,
      isValid: false,
    };
  }
};

// Batch operations
export interface CertificateBatchOperation {
  certificateId: string;
  success: boolean;
  error?: string;
}

// Batch verify certificates
export const batchVerifyCertificates = async (
  certificateIds: string[]
): Promise<CertificateBatchOperation[]> => {
  const results: CertificateBatchOperation[] = [];
  
  for (const id of certificateIds) {
    try {
      const isValid = await verifyCertificate(id);
      results.push({
        certificateId: id,
        success: isValid,
      });
    } catch (error) {
      results.push({
        certificateId: id,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  
  return results;
};