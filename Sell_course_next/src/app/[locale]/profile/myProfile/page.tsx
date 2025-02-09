"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BannerUser from "@/components/BannerUser";
import SignIn from "../../auth/login/page";
import DashBoardUser from "@/components/DashBoardUser";
import "../../../../style/UserProfilePage.css";
import { fetchUserDetails } from "@/app/api/auth/User/route";
import { useTranslations } from "next-intl";

export interface User {
  id?: string;
  user_id?: string; 
  email: string | null | undefined;
  username: string;
  avatarImg: string;
  gender: string | null;
  birthDay: string | null;
  phoneNumber: string | null;
  role: string;
  token?: string;
}


const MyProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);  
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); 
  const t = useTranslations('myProfile')

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user) {
      const formattedUser: User = {
        id: session.user.id ?? "",
        user_id: session.user.user_id ?? "",
        email: session.user.email ?? "", 
        username: session.user.name ?? "Unknown",
        avatarImg: session.user.avatarImg ?? "",
        gender: session.user.gender ?? null,
        birthDay: session.user.birthDay ?? null,
        phoneNumber: session.user.phoneNumber ?? null,
        role: session.user.role ?? "",
        token: session.user.token ?? "",
      };
      setUser(formattedUser);
      fetchUserData(session.user?.user_id);
    }
  }, [session, status, router]);
  const fetchUserData = async (userId: string) => {
    if (!userId) return;
    setLoadingDetails(true);
    setError(null);
    try {
      const userDetails = await fetchUserDetails(userId);
      setUser(userDetails);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Failed to load user details. Please try again later.");
    } finally {
      setLoadingDetails(false);
    }
  };

  if (status === "loading" || loadingDetails) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div>{user ? <BannerUser user={user} /> : <SignIn />}</div>
      <div className="content-profile">
        <div className="dashboard">
          <DashBoardUser />
        </div>
        <div className="table-profile">
          <h1>{t('title')}</h1>
          {error && <div className="error-message">{error}</div>} {/* Show error message if available */}
          <div className="table-info">
            <div className="table-contain">
              <div className="tabel-content">
                <div className="title-info">{t('email')}</div>
                <div className="info">{user?.email || "N/A"}</div>
              </div>
              <div className="tabel-content">
                <div className="title-info">{t('username')}</div>
                <div className="info">{user?.username || "N/A"}</div>
              </div>
              <div className="tabel-content">
                <div className="title-info">{t('gender')}</div>
                <div className="info">{user?.gender || "N/A"}</div>
              </div>
              <div className="tabel-content">
                <div className="title-info">{t('birthDay')}</div>
                <div className="info">{user?.birthDay || "N/A"}</div>
              </div>
              <div className="tabel-content">
                <div className="title-info">{t('phoneNumber')}</div>
                <div className="info">{user?.phoneNumber || "N/A"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyProfilePage;

