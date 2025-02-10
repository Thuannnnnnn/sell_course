"use client"
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import SignIn from "@/app/[locale]/auth/login/page";
import DashBoardUser from "@/components/DashBoardUser";
import "../../../../../style/UserProfilePage.css";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import BannerUser from "@/components/BannerUser";
import Image from "next/image";
import defaultAvatar from "../../../../image/defait-img.png";
import { fetchUserDetails, updateUserProfile } from "@/app/api/auth/User/route";
import { GetUser } from "@/app/type/user/User";


const UpdateMyProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const localActive = useLocale();
  const [user, setUser] = useState<GetUser | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<GetUser>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const t = useTranslations('updateProfile');

  const token = session?.user.token
  const email = session?.user.email

  useEffect(() => {
    if (status === "loading") return;
    if (!email || !token) {
      setError("User not found or unauthorized.");
      return;
    }

    const fetchUser = async () => {
      try {
        const userDetails = await fetchUserDetails(token, email);
        setUser(userDetails);
        setFormData({
          email: userDetails.email,
          username: userDetails.username,
          gender: userDetails.gender,
          birthDay: userDetails.birthDay,
          phoneNumber: userDetails.phoneNumber,
        });
      } catch {
        setError("Failed to load user details.");
      }
    };
    if (!user) fetchUser();
  }, [session, status]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

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
      setError(t('errorBirthDateAtLeast'));
      return;
    }

    if (formData.birthDay && new Date(formData.birthDay) > new Date()) {
      setError(t('errorBrithDate'));
      return;
    }

    const form = new FormData();
    form.append("email", formData.email || user?.email || "");
    if (formData.gender) form.append("username", formData.username || user?.username || "");
    if (formData.gender) form.append("gender", formData.gender);
    if (formData.birthDay) form.append("birthDay", formData.birthDay);
    if (formData.phoneNumber) form.append("phoneNumber", formData.phoneNumber);
    if (avatar) form.append("avatar", avatar);

    const token = session?.user?.token;
    if (!token) {
      setError(t('errorTokenNotFound'));
      return;
    }

    try {
      setIsLoading(true);
      const updatedUser = await updateUserProfile(form, token);
      setUser(updatedUser);
      alert("Profile updated successfully!");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Error updating profile.");
      } else {
        setError("Error updating profile.");
      }
    } finally {
      setIsLoading(false);
    }
  };


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
            <h2>{t('title')}</h2>
            <div className="link">
              <Link className="link-profile" href={`/${localActive}/profile/setting/updateMyProfile`}>
                <h6 className="active">{t('title-profile')}</h6>
              </Link>
              <Link className="link-profile" href={`/${localActive}/profile/setting/changePassword`}>
                <h6>{t('title-password')}</h6>
              </Link>
            </div>
          </div>
          <div className="form-update">
            <div className="card-user">
              <div className="avatar">
                <Image src={user?.avatarImg || defaultAvatar} alt="User Avatar" className="avatar-img" layout="fixed" width={100} height={100} />
                <input className="avatar-upload" type="file" id="avatar" onChange={handleFileChange} />
              </div>
              <span className="name">{user?.username || "Unknown User"}</span>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">{t('email')}</label>
                <input disabled type="email" id="email" name="email" value={formData.email || ""} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label htmlFor="username">{t('username')}</label>
                <input type="text" id="username" name="username" value={formData.username || ""} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label htmlFor="gender">{t('gender')}</label>
                <input type="text" id="gender" name="gender" value={formData.gender || ""} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label htmlFor="birthDay">{t('birthDay')}</label>
                <input type="date" id="birthDay" name="birthDay" value={formData.birthDay || ""} onChange={handleInputChange} max={getMaxDate()} />
              </div>
              <div className="input-group">
                <label htmlFor="phoneNumber">{t('phoneNumber')}</label>
                <input type="text" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleInputChange} />
              </div>
              <button className="btn-update" type="submit" disabled={isLoading}>
                {isLoading ? t('btnChange-2') : t('btnChange-1')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateMyProfilePage;

