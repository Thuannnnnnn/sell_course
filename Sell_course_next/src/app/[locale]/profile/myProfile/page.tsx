"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BannerUser from "@/components/BannerUser";
import SignIn from "../../auth/login/page";
import DashBoardUser from "@/components/DashBoardUser";
import "../../../../style/UserProfilePage.css";
import axios from "axios";

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

const MyProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);  // Allow null initially
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);  // Track errors

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user) {
      setUser(session.user);
      console.log("Session User:", session.user); // Log session user
      // Fetch additional user details from the backend
      fetchUserDetails(session.user?.user_id);
    }
  }, [session, status, router]);

  const fetchUserDetails = async (userId: string) => {
    if (!userId) return;
    setLoadingDetails(true);
    setError(null); // Reset error before starting the API call
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${userId}`
      );
      const userDetails = response.data;
      console.log("User Details from API:", userDetails); // Log API response
      setUser(userDetails); // Directly update user state with API data
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
          <h1>My Profile</h1>
          {error && <div className="error-message">{error}</div>} {/* Show error message if available */}
          <div className="table-info">
            <div className="table-contain">
              <div className="tabel-content">
                <div className="title-info">Email</div>
                <div className="info">{user?.email || "N/A"}</div>
              </div>
              <div className="tabel-content">
                <div className="title-info">Username</div>
                <div className="info">{user?.name || "N/A"}</div>
              </div>
              <div className="tabel-content">
                <div className="title-info">Gender</div>
                <div className="info">{user?.gender || "N/A"}</div>
              </div>
              <div className="tabel-content">
                <div className="title-info">Birthday</div>
                <div className="info">{user?.birthDay || "N/A"}</div>
              </div>
              <div className="tabel-content">
                <div className="title-info">Phone Number</div>
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

