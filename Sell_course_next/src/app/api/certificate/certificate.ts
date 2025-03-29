import axios from "axios";

interface User {
  user_id: string;
  email: string;
  username: string;
  password: string;
  avatarImg: string;
  gender: string | null;
  birthDay: string | null;
  phoneNumber: string | null;
  role: string;
  isOAuth: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  courseId: string;
  title: string;
  price: number;
  description: string;
  videoInfo: string;
  imageInfo: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

export interface Certificate {
  certificateId: string;
  title: string;
  createdAt: string;
  course: Course;
  user: User;
}

// Hàm tạo chứng chỉ
export const createCertificate = async (createCertificateData: {
  courseId: string;
  userId: string;
  title: string;
}): Promise<Certificate> => {
  try {
    console.log(createCertificateData);
    const response = await axios.post<Certificate>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/certificates`,
      createCertificateData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Có lỗi xảy ra khi tạo chứng chỉ"
      );
    }
    throw error;
  }
};

// Các hàm khác bạn đã cung cấp
export const getCertificateByUserId = async (
  userId: string
): Promise<Certificate[]> => {
  try {
    const response = await axios.get<Certificate[]>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/certificates/user/${userId}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi lấy thông tin chứng chỉ"
      );
    }
    throw error;
  }
};

export const getCertificateById = async (
  certificateId: string
): Promise<Certificate> => {
  try {
    const response = await axios.get<Certificate>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/certificates/${certificateId}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi lấy thông tin chứng chỉ"
      );
    }
    throw error;
  }
};

export const verifyCertificate = async (
  certificateId: string
): Promise<boolean> => {
  try {
    const response = await axios.get<boolean>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/certificates/${certificateId}/verify`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Có lỗi xảy ra");
    }
    throw error;
  }
};
