"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import BannerUser from "@/components/BannerUser";
import SignIn from "../../auth/login/page";
import DashBoardUser from "@/components/DashBoardUser";
import "../../../../style/UserProfilePage.css";
import { fetchUserDetails } from "@/app/api/auth/User/user";
import { useTranslations } from "next-intl";
import { GetUser } from "@/app/type/user/User";


const MyProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<GetUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("myProfile");

  useEffect(() => {
    if (status === "loading") return; // Đợi session load xong

    const token = session?.user?.token;
    const email = session?.user?.email;
    if (!session?.user || !session.user.email) {
      setError("User not found or unauthorized.");
      setLoading(false);
      return;
    }

    console.log("Session ne: ", session.user)

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const userDetails = await fetchUserDetails(token as string, email as string);
        setUser(userDetails);
      } catch {
        setError("Failed to load user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [session, status]);

  if (loading) return <div>Loading...</div>;
  if (error) return <SignIn />;

  return (
    <>
      <div>{user ? <BannerUser user={user} /> : <SignIn />}</div>
      <div className="content-profile">
        <div className="dashboard">
          <DashBoardUser />
        </div>
        <div className="table-profile">
          <h1>{t("title")}</h1>
          {error && <div className="error-message">{error}</div>}
          <div className="table-info">
            <div className="table-contain">
              <div className="tabel-content">
                <div className="title-info">{t("email")}</div>
                <div className="info">{user?.email || "N/A"}</div>
              </div>
              <div className="tabel-content">
                <div className="title-info">{t("username")}</div>
                <div className="info">{user?.username || "N/A"}</div>
              </div>
              <div className="tabel-content">
                <div className="title-info">{t("gender")}</div>
                <div className="info">{user?.gender || "N/A"}</div>
              </div>
              <div className="tabel-content">
                <div className="title-info">{t("birthDay")}</div>
                <div className="info">{user?.birthDay || "N/A"}</div>
              </div>
              <div className="tabel-content">
                <div className="title-info">{t("phoneNumber")}</div>
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
