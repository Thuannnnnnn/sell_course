import axios from "axios";

// Định nghĩa interface cho dữ liệu cài đặt
export interface Setting {
  id: string;
  logo: string;
  carousel: string[];
  isActive: boolean;
}

// Định nghĩa interface cho response lỗi
export interface ErrorResponse {
  message: string;
}

// Hàm xử lý GET request để lấy tất cả cài đặt
export async function getSetting(
  token: string
): Promise<Setting[] | ErrorResponse> {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/settings`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu cài đặt:", error);
    return { message: "Đã xảy ra lỗi khi lấy dữ liệu cài đặt" };
  }
}

// Hàm xử lý PATCH request để cập nhật cài đặt
export async function UpdateSetting(
  request: Request,
  token: string
): Promise<Setting | ErrorResponse> {
  try {
    // Kiểm tra nếu request là JSON hay FormData
    const contentType = request.headers.get("Content-Type") || "";
    console.log(request);
    let id = "";
    let data: FormData | { id: string; isActive?: boolean };

    if (contentType.includes("application/json")) {
      // Xử lý JSON data
      const jsonData = (await request.json()) as {
        id: string;
        isActive?: boolean;
      };
      id = jsonData.id;
      data = jsonData;
    } else {
      // Xử lý FormData
      const formData = await request.formData();
      id = formData.get("id") as string;
      data = formData;
    }

    // Kiểm tra id có tồn tại không
    if (!id) {
      console.error("ID không được định nghĩa");
      return { message: "ID không được định nghĩa" };
    }

    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/settings/${id}`,
      data,
      {
        headers: {
          "Content-Type": contentType.includes("multipart/form-data")
            ? "multipart/form-data"
            : "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật cài đặt:", error);
    return { message: "Đã xảy ra lỗi khi cập nhật cài đặt" };
  }
}

// Hàm xử lý POST request để tạo cài đặt mới
export async function createSetting(
  request: Request,
  token: string
): Promise<Setting | ErrorResponse> {
  try {
    const formData = await request.formData();

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/settings`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo cài đặt mới:", error);
    return { message: "Đã xảy ra lỗi khi tạo cài đặt mới" };
  }
}
