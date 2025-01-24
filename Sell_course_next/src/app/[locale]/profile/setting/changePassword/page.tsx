"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import BannerUser from "@/components/BannerUser";
import SignIn from "@/app/[locale]/auth/login/page";
import Link from "next/link";
import DashBoardUser from "@/components/DashBoardUser";
import '../../../../../style/UserProfilePage.css'

const ChangePasswordPage: React.FC = () => {
  const t = useTranslations('changePassword')
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const localActive = useLocale();
  const [user, setUser] = useState<any>(null);

  // Ensure hooks are called consistently
      useEffect(() => {
        if (status === "unauthenticated") {
          router.push("/auth/login");
        } else if (status === "authenticated") {
          const storedUser = localStorage.getItem("user");
          setUser(storedUser ? JSON.parse(storedUser) : session.user);
        }
      }, [session, status, router]);

      // Handle loading state
      if (status === "loading") {
        return <div>Loading...</div>;
      }


  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = session?.user?.token;
      console.log("Token ne" , token)
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      const payload = { currentPassword, newPassword, confirmPassword };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/change-password`,
        payload,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert(response.data.message || "Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");  // Clear the fields after success
      router.push(`/${localActive}/profile`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
            {user ? <BannerUser user={user} /> : <SignIn />}
      </div>
      <div>
        <div>
        <div className="content-profile">
        <div className="dashboard"><DashBoardUser /></div>
        <div className="form-profile">
          <div className="form-header">
            <h2>{t('title')}</h2>
            <div className="link">
                <Link className="link-profile" href={`/${localActive}/profile/setting/updateMyProfile`}>
                    <h6 >{t('title-profile')}</h6>
                </Link>
                <Link className="link-profile" href={`/${localActive}/profile/setting/changePassword`}>
                  <h6 className="active">{t('title-password')}</h6>
                </Link>
            </div>
            <div className="change-password">
              {error && <p className="error-message">{error}</p>}
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="input-container">
                  <label htmlFor="currentPassword">{t('currentPassword')}</label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="input-container">
                  <label htmlFor="newPassword">{t('newPassword')}</label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="input-container">
                  <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  className="submit-button"
                  type="submit"
                  onClick={handleChangePassword}
                  disabled={isLoading}
                >
                  {isLoading ? t('btnChange-2') : t('btnChange-1')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </>
  );
};

export default ChangePasswordPage;

