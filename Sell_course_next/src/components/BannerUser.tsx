import React from "react";
import Image from "next/image";
import "../style/BannerUser.css";
import defaultAvatar from "../../public/defait-img.png";
import { GetUser } from "@/app/type/user/User";
// Define the type for the user prop
// interface User {
//   avatarImg?: string; // Thống nhất tên trường với MyProfilePage.tsx
//   username?: string;
// }


interface BannerUserProps {
  user: GetUser;
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
      <span className="name">{user?.username || "Unknown User"}</span>
    </div>
  );
}

