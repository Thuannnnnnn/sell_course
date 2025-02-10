"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import SignIn from "@/app/[locale]/auth/login/page";
import Link from "next/link";
import '../../../../../style/UserProfilePage.css'
import { User } from "next-auth";
import { changePassword, fetchUserDetails } from "@/app/api/auth/User/route";
import BannerUser from "@/components/BannerUser";
import DashBoardUser from "@/components/DashBoardUser";



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
  const [user, setUser] = useState<User | null>(null);

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
         setUser(userDetails)
       } catch {
         setError("Failed to load user details.");
       }
     };
     if (!user) fetchUser();
   }, [session, status]);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t('errorFillAllFields'));
      return;
    }

    if (newPassword === currentPassword) {
      setError(t('errorPasswordsMatch'));
      return;
    }

    if (newPassword.length < 8) {
      setError(t('errorPasswordTooShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('errorPasswordsDontMatch'));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = session?.user?.token;
      if (!token) {
        setError(t('errorTokenNotFound'));
        setIsLoading(false);
        return;
      }

      const data = await changePassword(token, currentPassword, newPassword, confirmPassword);
      alert(data.message || t('passwordChangeSuccess'));

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.push(`/${localActive}/profile/myProfile`);
    } catch (err) {
      setError(err as string);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
        {user ? <BannerUser user={user} /> : <SignIn />}
      </div>
      <div className="content-profile">
        <div className="dashboard"><DashBoardUser /></div>
        <div className="form-profile">
          <div className="form-header">
            <h2>{t('title')}</h2>
            <div className="link">
              <Link className="link-profile" href={`/${localActive}/profile/setting/updateMyProfile`}>
                <h6>{t('title-profile')}</h6>
              </Link>
              <Link className="link-profile" href={`/${localActive}/profile/setting/changePassword`}>
                <h6 className="active">{t('title-password')}</h6>
              </Link>
            </div>

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
    </>
  );
};

export default ChangePasswordPage;