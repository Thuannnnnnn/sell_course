import React from "react";
import Image from "next/image";
import axios from "axios";
import "../style/BannerUser.css";
import defaultAvatar from "../app/image/defait-img.png";

// Define the type for the user prop
interface User {
  avatarImg?: string; // Thống nhất tên trường với MyProfilePage.tsx
  name?: string;
}

interface BannerUserProps {
  user: User;
}

export default function BannerUser({ user }: BannerUserProps) {
  return (
    <div className="card">
      <div className="avatar">
        <Image
          src={user.avatarImg || defaultAvatar}
          alt="User Avatar"
          className="avatar-img"
          width={100}
          height={100}
        />
      </div>
      <span className="name">{user.name || "Unknown User"}</span>
    </div>
  );
}

// Hàm lấy userId từ API
export const getUserId = async (token: string): Promise<string | null> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data?.data?.user_id) {
      console.log("User ID:", response.data.data.user_id);
      return response.data.data.user_id;
    } else {
      console.warn("User ID không tồn tại trong phản hồi từ backend.");
      return null;
    }
  } catch (error) {
    console.error("Lỗi khi lấy User ID:", error);
    return null;
  }
};
