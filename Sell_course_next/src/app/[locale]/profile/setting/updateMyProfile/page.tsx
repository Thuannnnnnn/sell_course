"use client"
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SignIn from "@/app/[locale]/auth/login/page";
import DashBoardUser from "@/components/DashBoardUser";
import "../../../../../style/UserProfilePage.css";
import Link from "next/link";
import { useLocale } from "next-intl";
import BannerUser from "@/components/BannerUser";
import axios from "axios";
import Image from "next/image";
import defaultAvatar from "../../../../image/defait-img.png";
import { updateUserProfile } from "@/app/api/auth/User/route";

interface User {
  id: string;
  email: string;
  name: string;
  avatarImg: string;
  gender: string;
  birthDay: string;
  phoneNumber: string;
  role: string;
}

const UpdateMyProfilePage: React.FC = () => {
  const { data: session, status, update } = useSession(); // access the update function
  const router = useRouter();
  const localActive = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    email: "",
    name: "",
    gender: "",
    birthDay: "",
    phoneNumber: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log("Session Data:", session); // Kiểm tra session
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user) {
      setUser(session.user as User);
      setFormData({
        email: session.user.email,
        name: session.user.name,
        gender: session.user.gender,
        birthDay: session.user.birthDay,
        phoneNumber: session.user.phoneNumber,
      });
    }
  }, [session, status, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const isUserAtLeast10YearsOld = (birthDate: string) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    const age = today.getFullYear() - birthDateObj.getFullYear();
    return age >= 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.birthDay && !isUserAtLeast10YearsOld(formData.birthDay)) {
      setError("You must be at least 10 years old.");
      return;
    }

    if (formData.birthDay && new Date(formData.birthDay) > new Date()) {
      setError("Birthday cannot be in the future.");
      return;
    }

    if (!formData.email && !formData.name && !formData.gender && !formData.birthDay && !formData.phoneNumber && !avatar) {
      alert("Please update at least one field.");
      return;
    }

    const form = new FormData();
    form.append("email", formData.email || user?.email || "");
    form.append("username", formData.name || user?.name || "");
    if (formData.gender) form.append("gender", formData.gender);
    if (formData.birthDay) form.append("birthDay", formData.birthDay);
    if (formData.phoneNumber) form.append("phoneNumber", formData.phoneNumber);
    if (avatar) form.append("avatar", avatar);

    const token = session?.user?.token;
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      return;
    }

    try {
      setIsLoading(true);
      const updatedUser = await updateUserProfile(form, token);
      setUser(updatedUser);

      // Update session with new user data
      update({
        ...session,
        user: updatedUser,
      });

      alert("Profile updated successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error updating profile.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <SignIn />;
  }

  return (
    <>
      <div>{user ? <BannerUser user={user} /> : <SignIn />}</div>
      <div className="content-profile">
        <div className="dashboard">
          <DashBoardUser />
        </div>
        <div className="form-profile">
          <div className="form-header">
            <h2>Settings</h2>
            <div className="link">
              <Link className="link-profile" href={`/${localActive}/profile/setting/updateMyProfile`}>
                <h6 className="active">Profile</h6>
              </Link>
              <Link className="link-profile" href={`/${localActive}/profile/setting/changePassword`}>
                <h6>Password</h6>
              </Link>
            </div>
          </div>
          <div className="form-update">
            <div className="card-user">
              <div className="avatar">
                <Image src={user?.avatarImg || defaultAvatar} alt="User Avatar" className="avatar-img" layout="fixed" width={100} height={100} />
                <input className="avatar-upload" type="file" id="avatar" onChange={handleFileChange} />
              </div>
              <span className="name">{user?.name || "Unknown User"}</span>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={formData.email || ""} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="name" value={formData.name || ""} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label htmlFor="gender">Gender</label>
                <input type="text" id="gender" name="gender" value={formData.gender || ""} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label htmlFor="birthDay">Birthday</label>
                <input type="date" id="birthDay" name="birthDay" value={formData.birthDay || ""} onChange={handleInputChange} max={getMaxDate()} />
              </div>
              <div className="input-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input type="text" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleInputChange} />
              </div>
              <button className="btn-update" type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateMyProfilePage;

