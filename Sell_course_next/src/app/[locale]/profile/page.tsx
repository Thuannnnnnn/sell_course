"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BannerUser from "@/components/BannerUser";
import SignIn from "../auth/login/page";

const ProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
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

  return (
    <div>
      {user ? <BannerUser user={user} /> : <SignIn />}
    </div>
  );
};

export default ProfilePage;
